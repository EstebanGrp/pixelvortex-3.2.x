(function() {
    const items = new Set();
    let rafStarted = false;

    function animateAllItems() {
        if (items.size === 0) {
            rafStarted = false;
            return;
        }

        const now = Date.now();
        items.forEach(item => {
            if (!item.mesh.parent) {
                items.delete(item);
                return;
            }
            item.mesh.rotation.x += item.rotationSpeed;
            item.mesh.rotation.z += item.rotationSpeed;
            item.mesh.position.y += Math.sin(now * 0.001) * item.floatAmplitude;
        });

        requestAnimationFrame(animateAllItems);
    }

    function applyItemPhysics(itemMesh) {
        itemMesh.rotation.x = Math.random() * Math.PI / 2;
        itemMesh.rotation.z = Math.random() * Math.PI / 2;

        const itemData = {
            mesh: itemMesh,
            rotationSpeed: (Math.random() - 0.5) * 0.01,
            floatAmplitude: 0.02 + Math.random() * 0.02
        };

        items.add(itemData);

        if (!rafStarted) {
            rafStarted = true;
            requestAnimationFrame(animateAllItems);
        }
    }

    // Usar un hook si es posible, o el traverse actual
    if (typeof scene !== 'undefined') {
        scene.traverse((obj) => {
            if (obj.isItem) {
                applyItemPhysics(obj);
            }
        });
    }

    // Exponer para uso futuro
    window.applyItemPhysics = applyItemPhysics;
})();
