// 공통 헤더 컴포넌트 (<kkaebi-header> 태그로 사용)
class KkaebiHeader extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <header class="kkaebi-header">
        <h1 class="logo">
          깨비랑
          <span class="logo-icon">
            <img src="./assets/images/img_kkebi.png" alt="깨비랑 로고" />
          </span>
        </h1>
      </header>
    `;
  }
}

// 공통 푸터 컴포넌트 (<kkaebi-footer> 태그로 사용)
class KkaebiFooter extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <footer class="kkaebi-footer">
        <p class="footer-desc">신비로운 도깨비 친구가 준비한 AI 운세</p>
        <small class="copyright">&copy; 2027 깨비랑. All rights reserved.</small>
      </footer>
    `;
  }
}

// 로딩 방망이
class KkaebiLoading extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <div class="kkaebi-bangmangi-premium">
        <div class="bangmangi-body">
          <div class="bangmangi-head-shape"></div>
          <div class="spikes-grid">
            <span class="p-spike top-left"></span>
            <span class="p-spike top-right"></span>
            <span class="p-spike mid-left-1"></span>
            <span class="p-spike mid-center"></span>
            <span class="p-spike mid-right-1"></span>
            <span class="p-spike bot-left"></span>
            <span class="p-spike bot-right"></span>
          </div>
        </div>
        <div class="handle-wrap">
          <div class="handle-shaft"></div>
          <div class="handle-ring"></div>
        </div>
        <div class="bangmangi-aurora"></div>
      </div>
    `;
  }
}

// 카카오 채널
class KkaebiFriend extends HTMLElement {
  connectedCallback() {
    // 1. HTML 구조 정의
    this.innerHTML = `
      <div class="kkaebi-next-teaser">
        <div class="service-intro-box">
          <p class="intro-headline">나만을 위한 일상 속 수호신, 깨비랑과 친구가 되어보세요</p>
          <p class="intro-subtext">
            단순한 신년 풀이를 넘어 월별·일별로 변하는 더욱 자세한 맞춤형 시기별 운세를 배달해 드립니다. 
            남들에게 말 못 할 밤늦은 고민부터 오늘의 선택까지, 인공지능 깨비랑이 24시간 언제든 당신의 곁에서 명쾌하게 1:1 상담을 함께합니다.
          </p>
        </div>
        <div class="kkaebi-twin-buttons">
          <button type="button" class="btn-teaser-retry" id="retryBtn">다른 정보로 다시하기</button>
          <button type="button" class="btn-teaser-friend" id="friendBtn">깨비랑과 친구되기</button>
        </div>
      </div>

      <div id="kkaebiModalFriend" class="modal-overlay hidden">
        <div class="modal-content">
          <div class="modal-header">
            <h4 class="modal-title">매일 아침, 깨비랑의 다정한 운세가 배달됩니다</h4>
            <button type="button" class="modal-close-btn" id="modalCloseBtn"></button>
          </div>
          <div class="modal-body">
            <p class="modal-desc">깨비랑 카카오 채널을 추가하시면 매주 월요일 아침 나만을 위한 특별한 맞춤 조언 알림톡을 보내드려요. 지금 친구가 되고 일상 속 소중한 행운 타이밍을 놓치지 마세요.</p>
            <div class="modal-action-zone">
              <button type="button" class="btn-modal-kakao" id="kakaoLinkBtn">카카오톡으로 깨비랑 추가하기</button>
              <button type="button" class="btn-modal-close-today" id="modalCloseTodayBtn">오늘은 그냥 넘어가기</button>
            </div>
          </div>
        </div>
      </div>
    `;

    // 2. 💡 제공해주신 모달 제어 로직 이식 (this.querySelector로 스코프 제한)
    const kkaebiModalFriend = this.querySelector("#kkaebiModalFriend");
    const friendBtn = this.querySelector("#friendBtn");
    const modalCloseBtn = this.querySelector("#modalCloseBtn");
    const modalCloseTodayBtn = this.querySelector("#modalCloseTodayBtn");
    const kakaoLinkBtn = this.querySelector("#kakaoLinkBtn");
    const retryBtn = this.querySelector("#retryBtn");

    // 친구되기 팝업 모달 제어 함수
    const openModal = () => {
      if (kkaebiModalFriend) {
        kkaebiModalFriend.classList.remove("hidden");
        document.body.style.overflow = "hidden";
      }
    };

    const closeModal = () => {
      if (kkaebiModalFriend) {
        kkaebiModalFriend.classList.add("hidden");
        document.body.style.overflow = "";
      }
    };

    // 이벤트 리스너 연결
    if (friendBtn) friendBtn.addEventListener("click", openModal);
    if (modalCloseBtn) modalCloseBtn.addEventListener("click", closeModal);
    if (modalCloseTodayBtn) modalCloseTodayBtn.addEventListener("click", closeModal);

    // 카카오 링크 버튼 클릭 시
    if (kakaoLinkBtn) {
      kakaoLinkBtn.addEventListener("click", () => {
        alert("현재 준비중입니다. 정식 오픈하면 그때 만나요 ^^");
        closeModal();
      });
    }

    // 모달 바깥 영역(배경) 클릭 시 닫기
    if (kkaebiModalFriend) {
      kkaebiModalFriend.addEventListener("click", (e) => {
        if (e.target === kkaebiModalFriend) closeModal();
      });
    }

    // (참고) 다른 정보로 다시하기 버튼 리스너
    if (retryBtn) {
      retryBtn.addEventListener("click", () => {
        window.location.href = "./";
      });
    }
  }

  // 💡 컴포넌트가 화면에서 사라질 때 body의 스크롤 잠금을 해제해주는 안전장치
  // disconnectedCallback() {
  //   document.body.style.overflow = "";
  // }
}

// 브라우저 실행 환경에 맞춤형 커스텀 태그 등록
customElements.define("kkaebi-header", KkaebiHeader);
customElements.define("kkaebi-footer", KkaebiFooter);
customElements.define("kkaebi-loading", KkaebiLoading);
customElements.define("kkaebi-friend", KkaebiFriend);
