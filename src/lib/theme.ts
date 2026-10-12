export const THEME_STORAGE_KEY = "theme";

// 첫 페인트 전에 실행해 저장된 테마(없으면 시스템 설정)를 <html>에 적용한다.
export const THEME_INIT_SCRIPT = `try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");if(t==="dark"||(t!=="light"&&matchMedia("(prefers-color-scheme: dark)").matches))document.documentElement.classList.add("dark")}catch(e){}`;
