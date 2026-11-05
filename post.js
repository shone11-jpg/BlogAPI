const APIURL = "https://dummyjson.com/posts";

const articleContent = document.querySelector("#article-content");
const parameters = new URLSearchParams(window.location.search);
const postId = parameters.get("id");
const articleStatus = document.querySelector("#article-status");
const articleError = document.querySelector("#article-error");
const commentsStatus = document.querySelector("#comments-status");
const commentsList = document.querySelector("#comments-list");
const commentForm = document.querySelector("#comment-form");
const commentMessage = document.querySelector("#comment-form-message");


async function fetchPost() {
try {
articleStatus.textContent = "Loading article...";
articleError.hidden = true;
articleContent.setAttribute("aria-busy", "true");

if (!postId) {
throw new Error("Article ID is missing");
}

const response = await fetch(`${APIURL}/${postId}`);

if (!response.ok) {
throw new Error("Failed to load article");
}

const data = await response.json();

renderPost(data);

articleStatus.textContent = "";

} catch (error) {
console.error("Error fetching article:", error);

articleStatus.textContent = "";
articleError.textContent =
"Could not load article. Please try again.";
articleError.hidden = false;

} finally {
articleContent.setAttribute("aria-busy", "false");
}
}




function renderPost(posts){
    articleContent.innerHTML=`
    <h2>${posts.title}</h2>
    <p>${posts.body}</p>
    <p>views: ${posts.views}</p>    <p>tags: ${posts.tags.join(", ")}</p>
    <button id="edit-post-btn">Edit Title</button> 
    <button id="delete-post-btn">Delete Article</button>
`;
const editBtn = document.querySelector("#edit-post-btn");
editBtn.addEventListener("click", function() {
    const newTitle = prompt("Enter a new Title!");
    if(!newTitle || !newTitle.trim()){
        return; 
    }
    updatePost(newTitle.trim())
})
    const deleteBtn = document.querySelector("#delete-post-btn");
deleteBtn.addEventListener("click", async function() {
    const confirmed = confirm("are you sure want to delete this post?");
    if(!confirmed){
        return;
    }
    await deletePost();
})
} 


async function fetchComments() {
try {
commentsStatus.textContent = "Loading comments...";

const response = await fetch(`${APIURL}/${postId}/comments`);

if (!response.ok) {
throw new Error("Could not load comments");
}

const data = await response.json();

renderComments(data.comments);

if (data.comments.length === 0) {
commentsStatus.textContent = "No comments yet.";
} else {
commentsStatus.textContent = "";
}

} catch (error) {
console.error(error);
commentsStatus.textContent = "Could not load comments.";
}
}

fetchPost();
fetchComments();



function renderComments(comments){
    commentsList.innerHTML = "";

    comments.forEach(comment => {
        commentsList.innerHTML += `
            <div class="comment">
                <p>${comment.body}</p> 
                <p>Likes: ${comment.likes}</p>
            </div>
        `; 
    }); 
}


commentForm.addEventListener("submit", async function(event) {
event.preventDefault();

const userId = document.querySelector("#comment-user-id").value;
const body = document.querySelector("#comment-body").value;

try {
const response = await fetch("https://dummyjson.com/comments/add", {
method: "POST",

headers: {
"Content-Type": "application/json"
},

body: JSON.stringify({
body: body,
postId: Number(postId),
userId: Number(userId)
})
});

if (!response.ok) {
throw new Error("Could not post comment");
}

const data = await response.json();

console.log(data);
commentsList.innerHTML += `
<div class="comment">
<p>${data.body}</p>
<p>Likes: ${data.likes ?? 0}</p>
</div>
`

commentsStatus.textContent = "";
commentMessage.textContent = "Comment added successfully!"; 

commentForm.reset();

} catch (error) {
console.error(error);
commentMessage.textContent = "Failed to add comment.";
}
});


async function updatePost(newTitle) {
try {
const response = await fetch(`${APIURL}/${postId}`, {
method: "PATCH",

headers: {
"Content-Type": "application/json"
},

body: JSON.stringify({
title: newTitle
})
});

if (!response.ok) {
throw new Error("Could not update post");
}

const data = await response.json();

console.log("Updated post:", data);
const titleElement = articleContent.querySelector("h2");
titleElement.textContent = data.title;

} catch (error) {
console.error(error);
}
}

async function deletePost(){
    try{
        const response = await fetch (`${APIURL}/${postId}`,{
            method: "DELETE"
        });
        if(!response.ok){
            throw new Error("could not delete post");
        }
        const data = await response.json();
        console.log("Deleted post:", data);
        if(data.isDeleted){
            articleContent.innerHTML = 
            "<p>Article deleted successfully.</p>";
        }
    }catch (error){
        console.error(error);
    }
}
