function applyItemPhysics(itemMesh) {
    itemMesh.rotation.x = Math.random() * Math.PI / 2;
    itemMesh.rotation.z = Math.random() * Math.PI / 2;

    const rotationSpeed = (Math.random() - 0.5) * 0.01;
    const floatAmplitude = 0.02 + Math.random() * 0.02;

    function animatePhysics() {
        if (!itemMesh.parent) return;
        itemMesh.rotation.x += rotationSpeed;
        itemMesh.rotation.z += rotationSpeed;
        itemMesh.position.y += Math.sin(Date.now() * 0.001) * floatAmplitude;
        requestAnimationFrame(animatePhysics);
    }

    animatePhysics();
}

scene.traverse((obj) => {
    if (obj.isItem) {
        applyItemPhysics(obj);
    }
});
