// INITIALIZATION AND VALIDATION
document.addEventListener("DOMContentLoaded", () => {
  const matchingForm = document.getElementById("matchingForm");
  const userNameInput = document.getElementById("userName");
  const idolNameInput = document.getElementById("idolName");
  const submitBtn = document.getElementById("submitBtn");

  matchingForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const userName = userNameInput.value.trim();
    const idolName = idolNameInput.value.trim();

    if (!userName) {
      alert("당신의 이름을 입력해 주세요.");
      userNameInput.focus();
      return;
    }

    if (!idolName) {
      alert("최애 아이돌의 이름을 입력해 주세요.");
      idolNameInput.focus();
      return;
    }

    if (userName.length > 10 || idolName.length > 10) {
      alert("이름은 10자 이내로 입력해 주세요.");
      return;
    }

    // REDIRECT ACTION
    const encodedUser = encodeURIComponent(userName);
    const encodedIdol = encodeURIComponent(idolName);

    submitBtn.disabled = true;
    submitBtn.style.opacity = "0.7";
    submitBtn.innerText = "궁합 분석하는 중...";

    setTimeout(() => {
      window.location.href = `favorResult?user=${encodedUser}&idol=${encodedIdol}`;
    }, 800);
  });
});
