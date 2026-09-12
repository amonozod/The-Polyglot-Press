document.addEventListener("DOMContentLoaded", function () {
  var toggle = document.getElementById("navToggle");
  var nav = document.getElementById("mainNav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () { nav.classList.toggle("open"); });
  }

  // Star rating widget
  document.querySelectorAll(".stars[data-interactive]").forEach(function (starsEl) {
    var slug = starsEl.getAttribute("data-slug");
    starsEl.querySelectorAll(".star").forEach(function (star, idx) {
      star.style.cursor = "pointer";
      star.addEventListener("click", async function () {
        starsEl.querySelectorAll(".star").forEach(function (s, i) {
          s.textContent = i <= idx ? "★" : "☆";
          s.classList.toggle("empty", i > idx);
        });
        var feedback = document.getElementById("ratingFeedback");
        if (feedback) feedback.textContent = "Thanks for rating this " + (idx + 1) + "/5!";
        if (slug && window.postRating) {
          try {
            await postRating(slug, idx + 1);
            if (window.loadRatingSummary) loadRatingSummary(slug, "ratingSummary");
          } catch (e) { /* ignore if not configured */ }
        }
      });
    });
  });

  // Comment form
  var form = document.getElementById("commentForm");
  if (form) {
    var slug = form.getAttribute("data-slug");
    form.addEventListener("submit", async function (e) {
      e.preventDefault();
      var name = document.getElementById("commentName").value.trim() || "Anonymous";
      var text = document.getElementById("commentText").value.trim();
      if (!text) return;
      if (slug && window.postComment) {
        try {
          await postComment(slug, name, text);
          if (window.loadComments) loadComments(slug, "commentList");
          form.reset();
          return;
        } catch (e) { /* fall through to local-only demo append */ }
      }
      var list = document.getElementById("commentList");
      var item = document.createElement("div");
      item.className = "comment-item";
      item.innerHTML = '<div class="comment-avatar">' + name.charAt(0).toUpperCase() + '</div>' +
        '<div><span class="comment-name">' + name + '</span><span class="comment-date">Just now</span>' +
        '<div class="comment-text"></div></div>';
      item.querySelector(".comment-text").textContent = text;
      list.prepend(item);
      form.reset();
    });
  }
});
