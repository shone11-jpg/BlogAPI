
const API_URL = "https://dummyjson.com/posts?limit=15";

// HTML-element
const postsContainer = document.querySelector("#posts-container");
const statusMessage = document.querySelector("#status-message");
const errorMessage = document.querySelector("#error-message");

const searchInput = document.querySelector("#search-input");
const tagFilter = document.querySelector("#tag-filter");
const sortSelect = document.querySelector("#sort-select");

const pagination = document.querySelector("#pagination");
const previousPage = document.querySelector("#previous-page");
const nextPage = document.querySelector("#next-page");
const pageIndicator = document.querySelector("#page-indicator");

// Variabler
let allPosts = [];
let currentPage = 1;
const postsPerPage = 10;


// 1. HÄMTA ARTIKLAR FRÅN API
async function fetchPosts() {
try {
statusMessage.textContent = "Loading articles...";
errorMessage.hidden = true;
postsContainer.setAttribute("aria-busy", "true");

const response = await fetch(API_URL);

if (!response.ok) {
throw new Error("Failed to load articles");
}

const data = await response.json();

allPosts = data.posts;

loadTags();
updatePosts();

statusMessage.textContent = "";
postsContainer.setAttribute("aria-busy", "false");

} catch (error) {
console.error("Error fetching posts:", error);

statusMessage.textContent = "";
errorMessage.textContent =
"Could not load articles. Please try again later.";
errorMessage.hidden = false;

postsContainer.setAttribute("aria-busy", "false");
pagination.hidden = true;
}
}


// 2. VISA ARTIKLAR PÅ SIDAN
function renderPosts(posts) {
postsContainer.innerHTML = "";

if (posts.length === 0) {
postsContainer.innerHTML =
"<p>No articles found.</p>";
return;
}

posts.forEach(post => {
postsContainer.innerHTML += `
<article class="post-card">
<h3>${post.title}</h3>
<p>${post.body}</p>
<p>Views: ${post.views}</p>
<p>Tags: ${post.tags.join(", ")}</p>

<a href="post.html?id=${post.id}">
Read More
</a>
</article>
`;
});
}


// 3. LADDA TAGGAR TILL DROPDOWN
function loadTags() {
const tags = allPosts.flatMap(post => post.tags);

const uniqueTags = [...new Set(tags)];

uniqueTags.forEach(tag => {
const option = document.createElement("option");

option.value = tag;
option.textContent = tag;

tagFilter.appendChild(option);
});
}


// 4. SÖK, FILTRERA OCH SORTERA
function updatePosts() {
const searchText = searchInput.value.toLowerCase().trim();
const selectedTag = tagFilter.value;
const sortValue = sortSelect.value;

let filteredPosts = allPosts.filter(post => {

const matchesSearch =
post.title.toLowerCase().includes(searchText) ||
post.body.toLowerCase().includes(searchText);

const matchesTag =
selectedTag === "all" ||
post.tags.includes(selectedTag);

return matchesSearch && matchesTag;
});

if (sortValue === "views-desc") {
filteredPosts.sort((a, b) => b.views - a.views);

} else if (sortValue === "reactions-desc") {
filteredPosts.sort(
(a, b) => b.reactions.likes - a.reactions.likes
);
}

showPage(filteredPosts);
}


// 5. VISA RÄTT SIDA
function showPage(posts) {
const totalPages = Math.ceil(posts.length / postsPerPage);

currentPage = Math.max(
1,
Math.min(currentPage, totalPages)
);

const startIndex = (currentPage - 1) * postsPerPage;
const endIndex = startIndex + postsPerPage;

const pagePosts = posts.slice(startIndex, endIndex);

renderPosts(pagePosts);

pageIndicator.textContent =
`Page ${currentPage} of ${totalPages}`;

previousPage.disabled = currentPage === 1;
nextPage.disabled = currentPage >= totalPages;

pagination.hidden = totalPages <= 1;
}


// 6. ÅTERSTÄLL TILL SIDA 1
function resetAndUpdatePosts() {
currentPage = 1;
updatePosts();
}


// 7. EVENTLYSSNARE FÖR SÖKNING OCH FILTER
searchInput.addEventListener("input", resetAndUpdatePosts);
tagFilter.addEventListener("change", resetAndUpdatePosts);
sortSelect.addEventListener("change", resetAndUpdatePosts);


// 8. NEXT-KNAPPEN
nextPage.addEventListener("click", () => {
currentPage++;
updatePosts();
});


// 9. PREVIOUS-KNAPPEN
previousPage.addEventListener("click", () => {
currentPage--;
updatePosts();
});


// 10. STARTA APPEN
fetchPosts();

