const radialProgressSelectors = document.querySelectorAll(".radial-progress");

window.addEventListener('resize', () => {
    radialProgressSelectors.forEach(elem => {
       elem.removeChild(elem.firstChild);
       const bar = makeRadialProgress(elem);
       bar.style.transform = radialTransform(elem);
       bar.classList.add("radial-colored");
    });
});

radialProgressSelectors.forEach(elem => {
    elem.addEventListener("updateGraph", updateRadialProgress);
    if (elem.dataset.progress) {
        const bar = makeRadialProgress(elem);

        setTimeout(() => {
            bar.style.transition = "3s ease";
            bar.style.transform = radialTransform(elem);
            bar.classList.add("radial-colored");
            setTimeout(() => bar.style.transition = "none", 3000);
        });
    }
});

function updateRadialProgress(e) {
    e.target.querySelector(".radial-bar").style.transform = radialTransform(e.target);
}

function makeRadialProgress(elem) {
    const parent = elem.parentElement;
    const parentStyle = getComputedStyle(parent);
    const width = parent.clientWidth - (parseInt(parentStyle.paddingLeft) + parseInt(parentStyle.paddingRight));

    const overflow = document.createElement("div");
    overflow.style.width = width + "px";
    overflow.style.height = width / 2 + "px";
    overflow.style.position = "relative";
    overflow.style.overflow = "hidden";
    elem.appendChild(overflow);

    const bar = document.createElement("div");
    bar.classList.add("radial-bar");
    bar.style.width = width + "px";
    bar.style.height = width + "px";
    overflow.appendChild(bar);

    return bar;
}

function radialTransform(elem) {
    return `rotate(${45+(parseInt(elem.dataset.progress)*1.8)}deg)`
}