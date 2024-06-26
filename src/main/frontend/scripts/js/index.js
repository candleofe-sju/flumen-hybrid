const exitFullscreenBtn = document.querySelector('.exitFullscreenBtn');
const toggleFullscreenBtn = document.querySelector('.toggleFullscreenBtn');

const container = document.querySelector('.container');

enterFullscreenBtn.addEventListener('click', e => {
    fullscreen(container);
})

exitFullscreenBtn.addEventListener('click', e => {
    exitFullScreen();
})

toggleFullscreenBtn.addEventListener('click', e => {
    toggleFullScreen(container);
})

const fullscreen = element => {
    return element.requestFullscreen();
}

const exitFullScreen = () => {
    return document.exitFullscreen();
}

function toggleFullScreen(element) {
    if (!document.fullscreenElement) {
        if (element.requestFullscreen) return element.requestFullscreen();
    } else {
        if (document.exitFullscreen) return document.exitFullscreen();
    }
}