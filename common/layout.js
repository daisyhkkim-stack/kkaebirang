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
    this.innerHTML = `
        <div class="kkaebi-next-teaser">
          <div class="service-intro-box">
            <p class="intro-headline">나만을 위한 일상 속 수호신, 깨비랑과 친구가 되어보세요</p>
            <p class="intro-subtext">
              단순한 신년 풀이를 넘어 월별·일별로 변하는 더욱 자세한 맞춤형 시기별 운세를 배달해 드립니다. 남들에게 말 못 할 밤늦은 고민부터 오늘의 선택까지, 인공지능 깨비랑이 24시간 언제든 당신의
              곁에서 명쾌하게 1:1 상담을 함께합니다.
            </p>
          </div>

          <div class="kkaebi-twin-buttons">
            <button type="button" class="btn-teaser-retry" id="retryBtn">다른 정보로 다시하기</button>
            <button type="button" class="btn-teaser-friend" id="friendBtn">깨비랑과 친구되기</button>
          </div>
        </div>
    `;
  }
}

// 브라우저 실행 환경에 맞춤형 커스텀 태그 등록
customElements.define("kkaebi-header", KkaebiHeader);
customElements.define("kkaebi-footer", KkaebiFooter);
customElements.define("kkaebi-loading", KkaebiLoading);
customElements.define("kkaebi-friend", KkaebiFriend);
