(() => {
  if (window.top !== window.self) return;

  const script = document.currentScript;
  const target = script?.dataset?.target;
  const suffix = target ? `#${target}` : "";

  window.location.replace(`../index.html${suffix}`);
})();
