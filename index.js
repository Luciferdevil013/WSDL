gsap.registerPlugin(ScrollTrigger);
function splitText(element){
    const elementSelector = document.querySelector(element);
    const elementSplit = new SplitType(elementSelector,{types: 'lines, words'});
    return elementSplit.words;
}


function videoPlayerAnimation(){
    const liness = document.querySelector('.videoTextHeader .video-sub .liness');
    const link = document.querySelector('.videoTextHeader .video-sub .links');

    const herotl = gsap.timeline({});
    herotl.from(splitText('.videoTextHeader .h1-heading'),{
        y:100,
        duration: 1,
    },'first')
    .from(splitText('.videoTextHeader .video-sub .first'), {
        y:100,
        duration: 1,
    },'first')
    .from(splitText('.videoTextHeader .video-sub .second'), {
        y:100,
        duration: 1,
    },'first')
    .from(liness, {
        scaleX: 0,
        duration: 1,
        transformOrigin: 'left',
    }, 'first')
    .from(link, {
        y:100,
        opacity:0,
        duration: 1,
    },'first')
}

videoPlayerAnimation();

const tagAnimation = gsap.timeline({
    scrollTrigger: {
        trigger: '.tag-line',
        start: 'top 40%',
        end: 'top bottom',
    }
});

tagAnimation.from(splitText('.tag-line .h4-heading'), {
    y: 100,
    duration: 0.7,
}, 'tag')

tagAnimation.from(splitText('.tag-line .unbeat'), {
    y: 100,
    duration: 0.7,
}, 'tag')
tagAnimation.from(splitText('.tag-line .quality'), {
    y: 100,
    duration: 0.7,
}, 'tag')
tagAnimation.from(splitText('.tag-line .invent'), {
    y: 100,
    duration: 0.7,
}, 'tag')


const todayDealAnimation = gsap.timeline({
    scrollTrigger: {
        trigger: '.today-deal',
        start: 'top 50%',
        end: 'top bottom',
    }
});

todayDealAnimation.from(splitText('.today .h3-heading'), {
    y: 100,
    duration: 0.7,
}, 'today')

todayDealAnimation.from('.today .slider', {
    y: 100,
    opacity: 0,
    duration: 0.7,
}, 'today')

const categoryAnimation = gsap.timeline({
    scrollTrigger: {
        trigger: '.categories',
        start: 'top 50%',
        end: 'top bottom',
    }
});

categoryAnimation.from(splitText('.categories .h3-heading'), {
    y: 100,
    duration: 0.7,
}, 'category')
categoryAnimation.from('.categories .categories-show', {
    y: 100,
    opacity: 0,
    duration: 0.7,
}, 'category')

const exploreAnimation = gsap.timeline({
    scrollTrigger: {
        trigger: '.explore-lots',
        start: 'top 50%',
        end: 'top bottom',
    }
});

exploreAnimation.from(splitText('.explore-lots .h3-heading'), {
    y: 100,
    duration: 0.7,
}, 'explore')
exploreAnimation.from('.explore-lots .slider', {
    y: 100,
    opacity: 0,
    duration: 0.7,
}, 'explore')