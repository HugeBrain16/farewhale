$(document).ready(function () {
  $(".tree-label").on("click", function () {
    $(this).parent(".tree-folder").toggleClass("expanded");
  });
});
