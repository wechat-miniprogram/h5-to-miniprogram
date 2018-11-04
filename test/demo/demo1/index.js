const tabs = document.querySelectorAll('.nav .title-list li');
const selectTapLine = document.querySelector('.nav .icon-active');
const pages = document.querySelectorAll('.news-list');
const loading = document.getElementById('spin');

let count = 0;
function dfs(node) {
    count++;
    if (node.childNodes && node.childNodes.length) {
        for (let child of node.childNodes) {
            dfs(child);
        }
    }
}
dfs(document.body);
console.log('node count ---> ', count);

function showLoading() {
    loading.style.display = 'block';
    setTimeout(function() {
        showPage1();
        hideLoading();
    }, 1000);
}

function hideLoading() {
    loading.style.display = 'none';
}

function showPage1() {
    pages[0].style.display = 'block';
    pages[1].style.display = 'none';
    selectTapLine.classList.remove('pull-right');
    hideLoading();
}

function showPage2() {
    pages[0].style.display = 'none'; 
    pages[1].style.display = 'block';
    selectTapLine.classList.add('pull-right');
    hideLoading();
}

tabs[0].addEventListener('click', function(evt) {
    showPage1();
});

tabs[1].addEventListener('click', function(evt) {
    showPage2();
});

showLoading();

if (window.I_am_extend_function) {
    console.log('window extend function: ', window.I_am_extend_function, window.I_am_extend_function());
}

if (window.I_am_another_extend_function) {
    console.log('window another extend function: ', window.I_am_another_extend_function, window.I_am_another_extend_function());
}
