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
                const canvas = document.querySelector('canvas');
                if (!canvas) return;
                const ctx = canvas.getContext('2d');

                const x = canvas.width / 2;
                const y = canvas.height / 2;

                drawCrosshair(ctx, x, y);
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
