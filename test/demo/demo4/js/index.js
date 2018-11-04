$(document).ready(function(){
    console.log('ready');

    const swiper = new Swiper('.swiper-container',{
        onInit: function(swiper){
            swiperAnimateCache(swiper);
            swiperAnimate(swiper);
        },
        onSlideChangeEnd: function(swiper){
            swiperAnimate(swiper);
        },
        direction: 'vertical',
        nextButton: '.arrow'
    });

    function doStatic(staticData = null){
        if(!staticData){
            return;
        }
        const { title, people, data} = staticData;
        const numberHtml = `<span>${people}</span><span>人次</span>`;
        const titleHtml = `<p>${title}</p>`;
        $('#people').html(numberHtml);
        $('.traffic-static header .title').html(titleHtml);
        const result = [];
        data.forEach((item, index) => {
            const num = Math.floor(item / 5000);
            const last = item / 5000 - num;
            let block = '';
            for(let i = 0; i < num; i++){
                block += `<div class="block ani" swiper-animate-effect="fadeIn" swiper-animate-duration="0.5s" swiper-animate-delay="${0.5+(num - i) * 0.1}s"></div>`;
            }
            block += `<div class="block" width=".76rem" height="${last * 0.05}rem"`;
            const proccess = `<div class="number">${item}</div><div class="proccess">${block}</div>`;
            result.push(proccess);
        });
        $('.proccess-content').each((index, item) => {
            $(item).html(result[index]);
        });
    }

    function home(home = null){
        if(!home){
            return;
        }
        $('.middle-border').text(home.time);
    }

    function popularity(popularity = null){
        if(!popularity){
            return;
        }
        const { title, data } = popularity;
        $('#popularity .title').text(title);
        let html = '';
        data.forEach((item, index) => {
            html += `<li class="activity ani" swiper-animate-effect="fadeInUp" swiper-animate-duration="0.5s" swiper-animate-delay="0.5s">
                <div class="content ani" swiper-animate-effect="zoomIn" swiper-animate-duration="0.5s" swiper-animate-delay="0.5s">
                    <p>${item.title}</p>
                    <p>公众号：${item.gongzhonghao}</p>
                </div>
                <div class="line ani" swiper-animate-effect="zoomIn" swiper-animate-duration="0.5s" swiper-animate-delay="0.5s"></div>
                <div class="number ani" swiper-animate-effect="zoomIn" swiper-animate-duration="0.5s" swiper-animate-delay="0.5s">
                    <p>参与人数</p>
                    <p>${item.number}</p>
                </div>
            </li>`
        });
        $('#popularity .middle-content').html(html);
    }

    function top(top = null){
        if(!top){
            return;
        }
        const { title, data } = top;
        $('#top .title').text(title);
        let html = '';
        data.forEach((item, index) => {
            html += `<li class="activity ani" swiper-animate-effect="fadeInUp" swiper-animate-duration="0.5s" swiper-animate-delay="0.5s">
                <div class="content ani" swiper-animate-effect="zoomIn" swiper-animate-duration="0.5s" swiper-animate-delay="0.5s">
                    <p>${item.title}</p>
                    <p>公众号：${item.gongzhonghao}</p>
                </div>
                <div class="line ani" swiper-animate-effect="zoomIn" swiper-animate-duration="0.5s" swiper-animate-delay="0.5s"></div>
                <div class="number ani" swiper-animate-effect="zoomIn" swiper-animate-duration="0.5s" swiper-animate-delay="0.5s">
                    <p>参与人数</p>
                    <p>${item.number}</p>
                </div>
            </li>`
        });
        $('#top .middle-content').html(html);
    }

    function analysis(analysis = null){
        if(!analysis){
            return;
        }
        const { title, subtitle, imgs, content} = analysis;
        $('.hot-activity .title').text(title);
        $('.hot-activity .activity-title').text(subtitle);
        const defaultImage = '../images/occupy-img.png';
        $('.hot-activity .image').each((index, item) => {
            if(index > imgs.length){
                $(item).html(`<img src="${defaultImage}"/>`);
            }else{
                $(item).html(`<img src="${imgs[index]}"/>`);
            }
        });
        $('.hot-activity .introduction').text(content);
    }

    function rank(rank = null){
        if(!rank) return;
        const { title, data } = rank;
        $('#fans').text(title);
        let serial = '';
        let gongzhonghao = '';
        let increase = '';
        data.forEach((item, index) => {
            serial += `<li class="ani" swiper-animate-effect="zoomIn" swiper-animate-duration="0.2s" swiper-animate-delay="${0.7 + 0.1 * index}s">${item.id}</li>`;
            gongzhonghao += `<li class="ani" swiper-animate-effect="zoomIn" swiper-animate-duration="0.2s" swiper-animate-delay="${0.7 + 0.1 * index}s">${item.gongzhonghao}</li>`;
            increase += `<li class="ani" swiper-animate-effect="zoomIn" swiper-animate-duration="0.2s" swiper-animate-delay="${0.7 + 0.1 * index}s">${item.number}</li>`;
        });
        $('.serial-number').html(serial);
        $('.gongzhonghao-list').html(gongzhonghao);
        $('.increase-number').html(increase);
    }

    function final(final = null){
        if(!final) return;
        const { title, data } = final;
        $('.final-content-title').text(title);
        let html = '';
        data.forEach((item, index) => {
            if(index === 2){
                html += `<div class="content-previous ani" swiper-animate-effect="fadeInUp" swiper-animate-duration="0.5s" swiper-animate-delay="${0.5 + index * 0.1}s">${item}</div>`;
                return;
            }
            html += `<div class="content-previous ani" swiper-animate-effect="fadeInUp" swiper-animate-duration="0.5s" swiper-animate-delay="${0.5 + index * 0.1}s">${item}</div>
            <div class="connect-linear ani" swiper-animate-effect="fadeInUp" swiper-animate-duration="0.5s" swiper-animate-delay="${0.6 + index * 0.1}s"></div>`;
        });
        $('.final .middle .content').html(html);
    }

    function init(data){
        home(data.home);
        doStatic(data.static);
        popularity(data.popularity);
        top(data.top);
        analysis(data.analysis);
        rank(data.fans); 
        final(data.final);
    }

    setTimeout(function() {
        init({
            "home": {
                "time": "2016.07.01-07.31"
            },
            "static":{
                "title": "2016年7.01-7.31期间共进行微信线上运营活动58场累计吸引参与用户约",
                "people": 800924,
                "data":[62000,92000,82000,152000]
            },
            "popularity":{
                "title": "最具人气活动",
                "data": [
                    {
                        "title": "2016年6月“浙江好人” 投票",
                        "gongzhonghao": "文明浙江",
                        "number": 10900
                    },
                    {
                        "title": "2016年6月“浙江好人” 投票",
                        "gongzhonghao": "文明浙江",
                        "number": 10900
                    },
                    {
                        "title": "2016年6月“浙江好人” 投票",
                        "gongzhonghao": "文明浙江",
                        "number": 10900
                    },
                    {
                        "title": "2016年6月“浙江好人” 投票",
                        "gongzhonghao": "文明浙江",
                        "number": 10900
                    },
                    {
                        "title": "2016年6月“浙江好人” 投票",
                        "gongzhonghao": "文明浙江",
                        "number": 10900
                    }
                ]
            },
            "top": {
                "title": "十佳人气活动",
                "data": [
                    {
                        "title": "2016年6月“浙江好人” 投票",
                        "gongzhonghao": "文明浙江",
                        "number": 10900
                    },
                    {
                        "title": "2016年6月“浙江好人” 投票",
                        "gongzhonghao": "文明浙江",
                        "number": 10900
                    },
                    {
                        "title": "2016年6月“浙江好人” 投票",
                        "gongzhonghao": "文明浙江",
                        "number": 10900
                    },
                    {
                        "title": "2016年6月“浙江好人” 投票",
                        "gongzhonghao": "文明浙江",
                        "number": 10900
                    },
                    {
                        "title": "2016年6月“浙江好人” 投票",
                        "gongzhonghao": "文明浙江",
                        "number": 10900
                    }
                ]
            },
            "analysis": {
                "title": "热点活动分析",
                "subtitle": "“迎G20杭州峰会·看下沙新变化”分析",
                "imgs": ["https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQfzkfrDs4N6Esp7vFyla4pSeAv9RwplGUUwpnLNQPxpNc2xlZ_", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQAz-pq_jA67iVeIijx1zqnFY7XadfGPaw-cB_b-OW1VGA4Q5IkJw"],
                "content": "活动介绍：为了与市民共同迎接G20杭州峰会的到来，杭州经济技术开发区管委会联合浙报集团杭州分社、浙江在线共同推出看新闻、找线索、开宝箱活动。从5月26日起，开发区推出线上寻宝活动，通过阅读四篇文章，找寻线索，就可以获得开启宝箱的密码。"
            },
            "fans": {
                "title": "粉丝增长榜",
                "data": [
                    {
                        "id":1,
                        "gongzhonghao": "浙江禁毒",
                        "number": 2332322
                    },
                    {
                        "id":2,
                        "gongzhonghao": "文明浙江",
                        "number": 2332322
                    },
                    {
                        "id":3,
                        "gongzhonghao": "亲子去哪儿",
                        "number": 2332322
                    },
                    {
                        "id":4,
                        "gongzhonghao": "嵊州发布",
                        "number": 2332322
                    },
                    {
                        "id":5,
                        "gongzhonghao": "浙江健康教育",
                        "number": 2332322
                    },
                    {
                        "id":6,
                        "gongzhonghao": "定海山",
                        "number": 2332322
                    },
                    {
                        "id":7,
                        "gongzhonghao": "浙江手机报",
                        "number": 2332322
                    },
                    {
                        "id":8,
                        "gongzhonghao": "品牌营销中心",
                        "number": 2332322
                    },
                    {
                        "id":9,
                        "gongzhonghao": "青春浙江",
                        "number": 2332322
                    },
                    {
                        "id":10,
                        "gongzhonghao": "浙江在线健康频道",
                        "number": 2332322
                    }
                ]
            },
            "final":{
                "title": "往期报告查询",
                "data": [
                    "2016年6月第二期","2016年6月第一期","2016年5月第二期"
                ]
            }
        });
    }, 500);
});