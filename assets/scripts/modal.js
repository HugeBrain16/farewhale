var modal2 = document.createElement("div");
var modalClose2 = document.createElement("span");

modal2.classList.add("modal");
modalClose2.classList.add("modal-close");
modalClose2.innerHTML = "&times;";
modalClose2.style.position = "fixed";

function addModalImage2(image) {
  var oldContent = modal2.getElementsByClassName("modal-content")[0];
  var content = document.createElement("div");
  var contentImg = document.createElement("img");
  content.classList.add("modal-content");
  content.classList.add("placeholder");
  content.style.cursor = "unset";
  if (oldContent) oldContent.remove();
  contentImg.addEventListener('click', (event) => {
    if (event.target == contentImg && contentImg.style.opacity === "1") {
      content.classList.toggle("zoomed");
    }
  });
  contentImg.onload = function () {
    content.classList.remove("placeholder");
    contentImg.style.opacity = 1;
    contentImg.style.cursor = "zoom-in";
  };
  content.appendChild(contentImg);
  modal2.appendChild(content);
  contentImg.src = image;
}

function openModal2(image) {
  modal2.style.display = "flex";
  addModalImage2(image);
}

document.body.appendChild(modal2);
modalClose2.onclick = function () {
  modal2.style.display = "none";
};

modal2.addEventListener('click', (event) => {
  var targetClass = event.target.classList;

  if (targetClass.contains("modal-inner") || targetClass.contains("modal-content")) {
    modal2.style.display = "none";
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    modal2.style.display = "none";
  }
});

function getImage(url) {
  if (!url.startsWith("https://i.imgur.com/"))
    return url;

  var result = "";
  var string = url.split("").reverse().join("");
  var skipmode = false;
  var skipped = false;

  for (let c of string) {
    if (skipmode) {
      skipmode = false;
      continue;
    }

    if (c === "." && !skipped) {
      skipmode = true;
      skipped = true;
    }

    result += c;
  }

  return result.split("").reverse().join("");
}

$(document).ready(function () {
  var thumbs = $(".gallery-modal");

  modal2.appendChild(modalClose2);
  $("body").prepend(modal2);

  for (let i = 0; i < thumbs.length; i++) {
    thumbs[i].onclick = function () {
      openModal2(getImage(thumbs[i].src));
    };
  }
});
