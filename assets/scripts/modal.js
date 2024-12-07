var modal = document.createElement("div");
var modalClose = document.createElement("span");

modal.classList.add("modal");
modalClose.classList.add("modal-close");
modalClose.innerHTML = "&times;";
modalClose.style.position = "fixed";

function openModal(img) {
  var modalContent = document.createElement("img");
  var oldModalContent = modal.getElementsByTagName("img")[0];

  if (oldModalContent) oldModalContent.remove();
  modalContent.classList.add("modal-content");
  modal.appendChild(modalContent);
  modal.style.display = "flex";
  modalContent.src = img;
}

document.body.appendChild(modal);
modalClose.onclick = function () {
  modal.style.display = "none";
};

modal.addEventListener('click', (event) => {
  if (event.target === modal) {
    modal.style.display = "none";
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    modal.style.display = "none";
  }
});

$(document).ready(function () {
  var thumbs = $(".gallery");

  modal.appendChild(modalClose);
  document.body.insertBefore(
    modal,
    document.getElementById("banner"),
  );

  for (let i = 0; i < thumbs.length; i++) {
    thumbs[i].onclick = function () {
      openModal(thumbs[i].src);
    };
  }
});
