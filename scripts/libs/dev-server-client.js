const wsUrl = `ws://${window.location.host}/__websocket`;
const sock = new WebSocket(wsUrl);

sock.addEventListener('message', (event) => {
  /** @type {{ createdAt: number; event: 'update'; targets: string[] }} */
  const devServerEvent = JSON.parse(event.data);

  if (devServerEvent.event === 'update') {
    const { createdAt: updatedAt, targets: updatedFiles } = devServerEvent;
    let replaceCount = 0;

    const filesShouldInvokePageReload = [
      window.location.pathname.replace(/\/(index.html)?$/, '') + '/index.html',
      ...Array.from(document.scripts)
        .map((scriptEl) => (scriptEl.src ? new URL(scriptEl.src).pathname : ''))
        .filter((p) => !!p),
    ];

    if (filesShouldInvokePageReload.some((pathname) => updatedFiles.includes(pathname))) {
      window.location.reload();
      return;
    }

    Array.from(document.styleSheets).forEach((styleSheet) => {
      if (!styleSheet.href) {
        return;
      }

      const hrefUrl = new URL(styleSheet.href);
      if (updatedFiles.includes(hrefUrl.pathname)) {
        const linkEl = styleSheet.ownerNode;
        hrefUrl.searchParams.set('updated_at', updatedAt.toString());
        linkEl.href = hrefUrl.toString();

        replaceCount++;
      }
    });

    Array.from(document.images).forEach((imageEl) => {
      if (!imageEl.src) {
        return;
      }

      const srcUrl = new URL(imageEl.src);
      if (updatedFiles.includes(srcUrl.pathname)) {
        srcUrl.searchParams.set('updated_at', updatedAt.toString());
        imageEl.src = srcUrl.toString();

        replaceCount++;
      }
    });

    if (updatedFiles.length !== replaceCount) {
      window.location.reload();
    }
  }
});
