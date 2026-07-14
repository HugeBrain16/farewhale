var modal = document.createElement("div");
var modalClose = document.createElement("span");
var modalPrev = document.createElement("span");
var modalNext = document.createElement("span");
var modalTelescope = document.createElement("div");
var page = 1;
var modalItem = 0;
var modalTelescopeIdx = 0;
var imageLinks = [];
var postLoadPost = function() {};
const hiddenTags = ["hidden"];

modal.classList.add("modal");
modalClose.classList.add("modal-close");
modalClose.innerHTML = "&times;";
modalPrev.classList.add("modal-prev");
modalPrev.innerHTML = "&lt;";
modalNext.classList.add("modal-next");
modalNext.innerHTML = "&gt;";
modalTelescope.classList.add("modal-telescope");

document.body.insertBefore(
  modal,
  document.getElementsByClassName("content-floatsie")[0],
);

function addModalImage(image) {
  var oldContent = modal.getElementsByClassName("modal-content")[0];
  var content = document.createElement("div");
  var contentImg = document.createElement("img");
  content.classList.add("modal-inner");
  content.classList.add("modal-content");
  content.classList.add("placeholder");
  content.style.cursor = "unset";
  if (oldContent) oldContent.remove();
  contentImg.addEventListener('click', (event) => {
    if (event.target == contentImg && contentImg.style.opacity === "1") {
      content.classList.toggle("zoomed");
    }

    if (content.classList.contains("zoomed"))
      modalTelescope.style.visibility = "hidden";
    else
      modalTelescope.style.visibility = "visible";
  });
  contentImg.onload = function () {
    content.classList.remove("placeholder");
    contentImg.style.opacity = 1;
    contentImg.style.cursor = "zoom-in";
  };
  content.appendChild(contentImg);
  content.appendChild(modalClose);
  content.appendChild(modalPrev);
  content.appendChild(modalNext);
  modal.appendChild(content);
  modal.appendChild(modalTelescope);
  contentImg.src = image;
}

function seekImage(direction) {
  if (direction.toLowerCase() === "left")
    modalItem--;
  else if (direction.toLowerCase() === "right")
    modalItem++;
  addModalImage(imageLinks[modalItem]);

  const activeItem = modalTelescope.getElementsByClassName("gallery-active")[0];
  if (activeItem)
    activeItem.scrollIntoView();
}

function openModal(gallery) {
  document.body.style.overflow = "hidden";
  modalTelescope.innerHTML = "";

  modalItem = 0;
  imageLinks = gallery.getAttribute("imagelinks").split(",");

  if (imageLinks.length > 1) {
    modalPrev.style.visibility = "visible";
    modalNext.style.visibility = "visible";
  }

  modal.style.display = "flex";
  addModalImage(imageLinks[modalItem]);
  modalPrev.addEventListener('click', (event) => {
    if (modalItem > 0) {
      seekImage("left");
    }
  });

  modalNext.addEventListener('click', (event) => {
    if (modalItem < imageLinks.length - 1) {
      seekImage("right");
    }
  });

  var telescopeItems = [];

  loadImages("/assets/gallery.txt")
    .then((images) => {
      for (let image of images) {
        let gallery2 = createImage(image);
        if (gallery2.getAttribute("imagelinks") == gallery.getAttribute("imagelinks"))
          gallery2.classList.add("gallery-active");

        const year = gallery2.getAttribute("postDate").split("-")[0];
        const selectedYear = $("#gallery-year").val();
        if (year !== selectedYear && selectedYear !== "all")
          continue;

        telescopeItems.push(gallery2);
      }
      sortPosts(telescopeItems, false);
      for (let idx = 0; idx < telescopeItems.length; idx++) {
        telescopeItems[idx].onclick = function() {
          modalTelescopeIdx = idx;
          openModal(telescopeItems[idx]);
        }
      }

      for (let item of telescopeItems) {
        modalTelescope.appendChild(item);
      }
      onModalOpened();

      const activeItem = modalTelescope.getElementsByClassName("gallery-active")[0];
      if (activeItem)
        activeItem.scrollIntoView();
    });
}

function closeModal() {
  document.body.style.overflow = "";

  modal.style.display = "none";
  modalPrev.style.visibility = "hidden";
  modalNext.style.visibility = "hidden";
  modalTelescope.innerHTML = "";

  modalItem = 0;
  imageLinks = [];
}

modalClose.onclick = function () {
  closeModal();
};

modal.addEventListener('click', (event) => {
  var targetClass = event.target.classList;

  if (targetClass.contains("modal-inner") || targetClass.contains("modal-content")) {
    closeModal();
  }
});

document.addEventListener('keydown', (event) => {
  if (event.repeat) return;

  if (event.key === 'Escape') {
    closeModal();
  }

  if (event.key === 'ArrowLeft') {
    if (modalItem > 0) {
      seekImage("left");
    }
  }

  if (event.key === 'ArrowRight') {
    if (modalItem < imageLinks.length - 1) {
      seekImage("right");
    }
  }

  const posts = modalTelescope.getElementsByClassName("gallery-container");

  if (event.key == "ArrowUp" || event.shiftKey && event.key === " ") {
    if (modalTelescopeIdx > 0) {
      modalTelescopeIdx--;
      let image = posts[modalTelescopeIdx].getElementsByClassName("gallery")[0];
      while (image.style.display === "none" && modalTelescopeIdx > 0) {
        modalTelescopeIdx--;
        image = posts[modalTelescopeIdx].getElementsByClassName("gallery")[0];
      }

      const targetPost = posts[modalTelescopeIdx];
      closeModal();
      openModal(targetPost);
    }
  }

  if (event.key == "ArrowDown" || !event.shiftKey && event.key === " ") {
    if (modalTelescopeIdx < posts.length - 1) {
      modalTelescopeIdx++;
      let image = posts[modalTelescopeIdx].getElementsByClassName("gallery")[0];
      while (image.style.display === "none" && modalTelescopeIdx < posts.length - 1) {
        modalTelescopeIdx++;
        image = posts[modalTelescopeIdx].getElementsByClassName("gallery")[0];
      }

      const targetPost = posts[modalTelescopeIdx];
      closeModal();
      openModal(targetPost);
    }
  }
});

function loadImages(file) {
  const timestamp = new Date().getTime();
  const url = `${file}?timestamp=${timestamp}`;

  return fetch(url)
    .then((response) => response.text())
    .then((images) => {
      var lines = images.split("\n");
      var result = [];

      for (let line of lines) {
        let image = {};
        line = line.trim();

        if (line.startsWith("#") || line === "") continue;

        let _image = line.split("|");
        if (_image.length < 2) continue;
        image["links"] = _image[0].trim().split(",");
        image["date"] = _image[1].trim();
        if (_image.length >= 3)
          image["crop"] = _image[2].trim();
        if (_image.length >= 4)
          image["tags"] = _image[3].trim().split(",");

        if (Object.keys(image).length !== 0) result.push(image);
      }

      return result;
    })
    .catch((error) => {
      console.error("Error reading file:", error);
    });
}

function filterImage(image) {
  if (image["tags"] !== undefined)
    return image["tags"].some(filter => hiddenTags.includes(filter));

  return false;
}

function getThumbnail(url) {
  var result = "";
  var string = url.split("").reverse().join("");
  var added = false;

  for (let c of string) {
    result += c;

    if (c === "." && !added) {
      result += "m";
      added = true;
    }
  }

  return result.split("").reverse().join("");
}

function createImage(image) {
  const container = document.createElement("div");
  container.classList.add("animate__animated");
  container.classList.add("animate__fadeIn");
  container.classList.add("animate__faster");
  container.classList.add("gallery-container");
  container.style.position = "relative";
  container.style.display = "inline-block";

  const gallery = document.createElement("img");
  gallery.classList.add("gallery");
  gallery.classList.add("placeholder");
  gallery.style.objectPosition = image["crop"] === undefined || image["crop"] === "default" ? "top center" : image["crop"];
  container.setAttribute("displaylink", 0);
  container.setAttribute("imagelinks", image["links"].join(","));

  const meta = image["date"].split(";");
  const date = meta[0].trim();
  const title = meta[1].trim();

  container.setAttribute("postDate", date);
  container.setAttribute("title", `${title}${title === '' ? '' : '\n'}${date}`);
  gallery.setAttribute("aria-hidden", "false");

  if (image["tags"] !== undefined) {
    gallery.setAttribute("tags", image["tags"]);
    if (filterImage(image)) {
      gallery.style.display = "none";
      gallery.setAttribute("aria-hidden", "true");
    }
  }

  const galleryL = document.createElement("span");
  galleryL.classList.add("gallery-multiple");
  galleryL.innerHTML = "<i class='fa-solid fa-images'></i>";

  container.appendChild(gallery);
  if (image["links"].length > 1)
    container.appendChild(galleryL);

  gallery.onload = function () {
    gallery.classList.remove("placeholder");
    gallery.style.opacity = 1;
    galleryL.style.opacity = 1;
  };
  gallery.src = getThumbnail(image["links"][0]);

  return container;
}

function sortPosts(posts, old = false) {
  posts.sort(function (a, b) {
    const dateA = new Date(a.getAttribute("postDate"));
    const dateB = new Date(b.getAttribute("postDate"));

    if (old) return dateA - dateB;
    else return dateB - dateA;
  });
}

function clearPosts() {
  $(".gallery-container").remove();
}

function injectYears() {
  var years = [];

  loadImages("/assets/gallery.txt").then((images) => {
    for (let image of images) {
      const instance = createImage(image);

      const year = instance.getAttribute("postDate").split("-")[0];
      if (!years.includes(year))
        years.push(year);
    }

    years.sort();
    for (let year of years) {
      $("#gallery-year").prepend(`<option value="${year}">${year}</option>`);
    }
    $("#gallery-year").val($("#gallery-year option:first").val());
  });

}

function loadPost(old = false, max = 0, pageMax = 30, filter = false, paged = false) {
  var content = document.getElementsByClassName("gallery-content")[0];
  var maxPost = 0;
  var posts = [];
  var chunks = [];
  var chunk = [];

  loadImages("/assets/gallery.txt")
    .then((images) => {
      for (let image of images) {
        if (filterImage(image) && filter === true)
          continue;

        const instance = createImage(image);
        const year = instance.getAttribute("postDate").split("-")[0];
        const selectedYear = $("#gallery-year").val();
        if (year !== selectedYear && selectedYear !== "all")
          continue;

        posts.push(instance);
      }

      sortPosts(posts, old);
      for (let idx = 0; idx < posts.length; idx++) {
        posts[idx].onclick = function() {
          modalTelescopeIdx = idx;
          openModal(posts[idx]);
        }
      }

      if (paged) {
        for (let post of posts) {
          if (chunk.length === pageMax) {
            chunks.push(chunk);
            chunk = [];
          }
          chunk.push(post);
        }

        if (chunk.length > 0)
          chunks.push(chunk);
      }

      if (page < 1)
        page = 1;
      else if (page > chunks.length)
        page--;

      clearPosts();
      for (let post of (paged ? chunks[page - 1] : posts)) {
        if (maxPost >= max && max !== 0)
          break;
        content.appendChild(post);
        maxPost++;
      }

      if (paged) {
        var pages = $("#gallery-page-pages");
        pages.empty();
        for (var pageX = 1; pageX <= chunks.length; pageX++) {
          let ePage = document.createElement("li");
          if (pageX === page)
            ePage.innerHTML = `<span id='gallery-page-current'>${pageX}</span>`;
          else
            ePage.innerHTML = `<span class="gallery-page-page">${pageX}</span>`;
          pages.append(ePage);
        }
      }

      $("body").off("click", ".gallery-page-page").on("click", ".gallery-page-page", function() {
        page = parseInt($(this).text());
        loadPost(old, max, pageMax, filter, paged);
      });

      $("#gallery-page-prev").off("click").on("click", function() {
        var currentPage = parseInt($("#gallery-page-current").text());

        page = currentPage - 1;
        if (page < 1)
          return;

        loadPost(old, max, pageMax, filter, paged);
      });

      $("#gallery-page-next").off("click").on("click", function() {
        var currentPage = parseInt($("#gallery-page-current").text());

        page = currentPage + 1;
        if (page > chunks.length)
          return;

        loadPost(old, max, pageMax, filter, paged);
      });
      postLoadPost();
    })
    .catch((error) => {
      console.error("Error loading images:", error);
    });
}
