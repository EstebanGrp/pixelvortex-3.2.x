(function() {
    const crosshairImage = new Image();
    crosshairImage.src = './mods/Better crosshair/gui/crosshairs.png';
    let loaded = false;
    crosshairImage.onload = () => loaded = true;

    const crosshairState = {
        variant: 'REGULAR',
        modifierUse: 'NONE',
        modifierHit: 'NONE'
    };

    const CROSSHAIR_SIZE = 32;

    let cachedCanvas = null;
    let cachedCtx = null;

    function drawCrosshair(ctx, x, y) {
        if (!loaded) return;
        ctx.save();
        ctx.globalAlpha = 1.0;
        ctx.drawImage(crosshairImage, x - CROSSHAIR_SIZE/2, y - CROSSHAIR_SIZE/2, CROSSHAIR_SIZE, CROSSHAIR_SIZE);
        ctx.restore();
    }

    function hookRender(originalRender) {
        return function(...args) {
            originalRender.apply(this, args);

            try {
                if (!cachedCanvas) {
                    cachedCanvas = document.querySelector('canvas');
                    if (cachedCanvas) cachedCtx = cachedCanvas.getContext('2d');
                }
                
                if (!cachedCtx) return;

                const x = cachedCanvas.width / 2;
                const y = cachedCanvas.height / 2;

                drawCrosshair(cachedCtx, x, y);
            } catch(e) {
                console.error('Error dibujando DynamicCrosshair:', e);
            }
        };
    }

    function initHook() {
        const check = setInterval(() => {
            const proto = window.Game?.prototype || window.GameClient?.prototype;
            if (proto && proto.render) {
                proto.render = hookRender(proto.render);
                console.log('[DynamicCrosshair] Inyectado con éxito.');
                clearInterval(check);
            }
        }, 1000);
    }

    initHook();

    window.DynamicCrosshair = {
        setVariant: (v) => crosshairState.variant = v,
        setModifierUse: (v) => crosshairState.modifierUse = v,
        setModifierHit: (v) => crosshairState.modifierHit = v
    };
})();
