const firebaseConfig = {
	apiKey: "AIzaSyCjQpWfaIZg2fixtjDiNppTh3pch42RWVA",
    authDomain: "miniproject-ca058.firebaseapp.com",
    databaseURL: "https://miniproject-ca058.firebaseio.com",
    projectId: "miniproject-ca058",
    storageBucket: "miniproject-ca058.appspot.com",
    messagingSenderId: "652655726371",
    appId: "1:652655726371:web:7491a98c27899eb688c696"
}

firebase.initializeApp(firebaseConfig)

const db = firebase.firestore()

// A promise that returns user if user is logged in, otherwise, catch
// ATTENTION!!! catches below are commented out due to seperate index.html file, please uncomment when pushing to production
const checkAuth = () => {
	return new Promise((resolve, reject) => {
		firebase.auth().onAuthStateChanged(() => {
			const user = firebase.auth().currentUser
			if (!user) {
				reject()
			} else {
				resolve(user)
			}
		})
	})
}

const showLoader = () => {
	$("#posts-box").html("<img src='images/loading.gif'>")
}

const postStuff = (content, type, fn) => {
	checkAuth().then((user) => {
		const {displayName, photoURL} = user
		db.collection("posts").add({
			user: { displayName, photoURL },
			content,
			type,
			comments: {},
			likes: [],
			date: firebase.firestore.FieldValue.serverTimestamp()
		}).then(() => {
			if (fn) {
				fn()
			}
		})
	})
	.catch(() => {
		window.location.href = "index.html"
	})
}

const retrievePosts = () => {
	showLoader()	
	checkAuth().then((user) => {
		const filters = $("input[type=checkbox]:checked").map((i, elem) => elem.value)
		let query = db.collection("posts")
		if (filters && filters.length) {
			query = query.where("type", "in", filters.toArray())
		}
		query.orderBy("date", "desc").get().then((rows) => {
			let posts = ""
			rows.forEach((row) => {
				const {comments, content, likes, type, user, date} = row.data()
				const liked = likes.find(i => i.displayName == user.displayName)
				posts += `
					<div class="post">
						<div class="post-header">
							<img src="${user.photoURL}" />
							<a href="#">${user.displayName}</a>
						</div>
						<div class="post-content">
							${content}
						</div>
						<div class="post-controls">
							<button data-postId="${row.id}" onclick="${liked ? "handleUnlike" : "handleLike"}()" style="background-color: #385898; color: ${liked ? "#37d1ff" : "white"};">Like ${likes.length}</button>
							<button data-postId="${row.id}" onclick="handleCommentClick()">Comment</button>
						</div>
						<div class="post-comment-form" style="display: none;">
							<form data-postId="${row.id}" class="post-comment" onsubmit="postCommentSubmit()">
								<textarea data-meteor-emoji="true" name="comment" placeholder="Write comment"></textarea>
								<input type="submit" />
							</form>
						</div>
						<div>
							${generateComments(comments, row.id)}
						</div>
					</div>
				`
			})
			$('#posts-box').html(posts)
			attachEmoji()
		})
	})
	.catch(() => {
		window.location.href = "index.html"
	})
}

const generateComments = (comments, parentId, layer) => {
	if (!layer) {
		layer = 1
	}
	let result = ""
	let iterable = Object.keys(comments).map((key) => [key, comments[key]])
	iterable.forEach(([key, c]) => {
		const {likes, user: {displayName, photoURL}} = c
		const liked = likes.find(i => i.displayName == firebase.auth().currentUser.displayName)
		const selfId = parentId + ".comments." + key
		result += `
			<div style="width: ${100 - (2 * layer)}%; margin: 5px; padding: 5px; margin-left: auto; border: 1px solid black;">
				<div class="post-header">
					<img height="100%" src="${photoURL}">
					<a href="#">${displayName}</a>
				</div>
				<br>
				<br>
				<br>
				${c.content}
				${generateComments(c.comments, selfId, layer + 1)}
				<div class="post-controls">
					<button data-commentId="${selfId}" onclick="${liked ? "handleCommentUnlike" : "handleCommentLike"}()" style="background-color: #385898; color: ${liked ? "#37d1ff" : "white"};">Like ${likes.length}</button>
					<button data-commentId="${selfId}" onclick="handleCommentClick()">Comment</button>
				</div>
				<div class="post-comment-form" style="display: none;">
					<form data-commentId="${selfId}" class="comment-comment" onsubmit="handleCommentComment()">
						<textarea data-meteor-emoji="true" type="text" name="comment" placeholder="Write comment"></textarea>
						<input type="submit" />
					</form>
				</div>
			</div>
		`
	})
	return result
}

const handleCommentLike = () => {
	checkAuth().then((user) => {
		const e = event
		const {displayName, photoURL} = user
		const [postId, ...commentId] = e.target.dataset.commentid.split(".")
		db.collection("posts").doc(postId).update({
			[commentId.join(".") + ".likes"]: firebase.firestore.FieldValue.arrayUnion({displayName, photoURL})
		})
		.then(() => {
			e.target.innerHTML = `Like ${parseInt(e.target.innerHTML.split(" ")[1]) + 1}`
			e.target.onclick = handleCommentUnlike
			e.target.style.color = "#37d1ff"
		})
		.catch((e) => {
			console.log(e)
		})
	})
	.catch(() => {
		window.location.href = "index.html"
	})
}

const handleCommentUnlike = () => {
	checkAuth().then((user) => {
		const e = event
		const {displayName, photoURL} = user
		const [postId, ...commentId] = e.target.dataset.commentid.split(".")
		db.collection("posts").doc(postId).update({
			[commentId.join(".") + ".likes"]: firebase.firestore.FieldValue.arrayRemove({displayName, photoURL})
		})
		.then(() => {
			e.target.innerHTML = `Like ${parseInt(e.target.innerHTML.split(" ")[1]) - 1}`
			e.target.onclick = handleCommentLike
			e.target.style.color = "white"
		})
	})
	.catch(() => {
		window.location.href = "index.html"
	})
}

const handleCommentComment = () => {
	const e = event
	e.preventDefault()
	checkAuth().then((user) => {
		const {displayName, photoURL} = user
		const [postId, ...commentId] = e.target.dataset.commentid.split(".")
		db.collection("posts").doc(postId).update({
			[commentId.join(".") + `.comments.${Date.now()}`]: {
				date: firebase.firestore.FieldValue.serverTimestamp(),
				likes: [],
				comments: {},
				content: e.target.children[0].querySelector('textarea').value,
				user: {
					displayName,
					photoURL
				}
			}
		})
		.then(() => {
			retrievePosts()
		})
	})
}

const handleCommentClick = () => {
	const e = event
	$(e.target.parentElement.nextElementSibling).slideToggle()
}

const handleLike = () => {
	checkAuth().then((user) => {
		const e = event
		const {displayName, photoURL} = user
		const postId = e.target.dataset.postid
		db.collection("posts").doc(postId).update({
			likes: firebase.firestore.FieldValue.arrayUnion({displayName, photoURL})
		})
		.then(() => {
			e.target.innerHTML = `Like ${parseInt(e.target.innerHTML.split(" ")[1]) + 1}`
			e.target.onclick = handleUnlike
			e.target.style.color = "#37d1ff"
		})
	})
	.catch(() => {
		window.location.href = "index.html"
	})
}

const handleUnlike = () => {
	checkAuth().then((user) => {
		const e = event
		const {displayName, photoURL} = user
		const postId = e.target.dataset.postid
		db.collection("posts").doc(postId).update({
			likes: firebase.firestore.FieldValue.arrayRemove({displayName, photoURL})
		})
		.then(() => {
			e.target.innerHTML = `Like ${parseInt(e.target.innerHTML.split(" ")[1]) - 1}`
			e.target.onclick = handleLike
			e.target.style.color = "white"
		})
	})
	.catch(() => {
		window.location.href = "index.html"
	})
}

const insertProfileImg = () => {
	checkAuth().then((user) => {
		$('.profile-img').attr('src', user.photoURL)
	})
	.catch(() => {
		window.location.href = "index.html"
	})
}

$('#post-form').on("submit", (e) => {
	e.preventDefault()
	const content = $("#post-form textarea")[0]
	const type = $("input[type=radio]:checked")[0]
	if (!type) {
		alert("No type specified!")
		return undefined
	}
	if (!content.value.trim()) {
		alert("No content to post!")
		return undefined
	}
	postStuff(content.value, type.value, () => {
		retrievePosts()
		$("#post-form textarea").val("")
		const type = $("input[type=radio]:checked")[0]
		type.checked = false
	})
})

$("input[type=checkbox]").on("change", () => {
	retrievePosts()
})

const postCommentSubmit = () => {
	const e = event
	e.preventDefault()
	checkAuth().then((user) => {
		const {displayName, photoURL} = user
		const postId = e.target.dataset.postid
		db.collection("posts").doc(postId).update({
			[`comments.${Date.now()}`]: {
				date: firebase.firestore.FieldValue.serverTimestamp(),
				likes: [],
				comments: {},
				content: e.target.children[0].querySelector('textarea').value,
				user: {
					displayName,
					photoURL
				}
			}
		})
		.then(() => {
			retrievePosts()
		})
	})
}

const attachEmoji = () => {
	new MeteorEmoji()
	$("[data-meteor-emoji='true']").removeAttr("data-meteor-emoji")
}

retrievePosts()

insertProfileImg()

attachEmoji()