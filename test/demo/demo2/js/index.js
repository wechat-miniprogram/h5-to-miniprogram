const table = (function($, win){
  var table = {
    init: function(){
      const _self = this;
      _self.setData();
    },
    fetch: function(){
      const _self = this;
      return new Promise((resolve, reject) => {
        setTimeout(function() {
          resolve({
            "officer":{
              "id":1,
              "name":"车俊",
              "gender":"男",
              "hometown":"安徽巢湖",
              "nation":"汉",
              "university":"中央党校",
              "degree":"中央党校大学学历",
              "title":"省委书记",
              "birthday":150000000000,
              "ccp_date":150000000000,
              "work_date":150000000000,
              "description":"官员简介说明",
              "photo":"data:image/jpeg;base64,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",
              "list_pic":"http://www.123123.com/photo.png ",
              "resumes":[
                  {
                    "year":2017,
                    "month":7,
                    "location":"杭州",
                    "title":"职务"
                  },
                  {
                    "year":2017,
                    "month":6,
                    "location":"杭州",
                    "title":"职务"
                  }
              ]
            },
            "article_list":[
              {}
            ]
          });
        }, 500);
      });
    },
    setData: function(){
      const _self = this;
      _self.fetch().then((data) => {
        _self.tepl(data);
      }, (err) => {
        console.log(err);
      }).catch((err) => {
        console.log(err);
      });
    },
    tepl: function(data){
      const _self = this;
      const { name, hometown, nation, university, degree, title, birthday, ccp_date, work_date, photo } = data.officer;
      const tableContent = `
        <tr>
          <th class="avatar">
            <img class="head-img" src="${photo}" />
          </th>
          <th>
            <p class="name">${name}</p>
            <p class="title">${title}</p>
          </th>
        </tr>
        <tr>
          <td class="thead">籍贯</td>
          <td class="content nation"><input type="text" value="${nation}"/></td>
        </tr>
        <tr>
          <td class="thead">民族</td>
          <td class="content hometown"><input type="text" value="${hometown}"/></td>
        </tr>
        <tr>
          <td class="thead">出生年月</td>
          <td class="content birthday"><input type="text" value="${_self.getTime(birthday)}"/></td>
        </tr>
          <tr>
          <td class="thead">入党时间</td>
          <td class="content ccp_time"><input type="text" value="${_self.getTime(ccp_date)}"/></td>
        </tr>
        <tr>
          <td class="thead">毕业院校</td>
          <td class="content university"><input type="text" value="${university}"/></td>
        </tr>
        <tr>
          <td class="thead">学历/学位</td>
          <td class="content degree"><input type="text" value="${degree}"/></td>
        </tr>
        <tr>
          <td class="thead">参与工作时间</td>
          <td class="content work_time"><input type="text" value="${_self.getTime(work_date)}"/></td>
        </tr>
      `;
      const table = document.createElement('table');
      table.innerHTML = tableContent;
      document.getElementsByClassName('container')[0].appendChild(table);
      const img = $('img')[0];
      img.onload = function(evt) {
        console.log('img load', img.width, img.height, evt);
      };

      $('input').on('focus', function() {
        console.log('focus event')
      });
      $('input').on('blur', function() {
        console.log('blur event')
      });
      $('input').on('input', function() {
        console.log('input event: ', $(this)[0].value)
      });
    },
    getTime: function(time){
      const date = new Date(time);
      return date.getFullYear() + '年' + date.getMonth() + '月';
    }
  }
  return table;
})(jQuery, window);

table.init();

// test ajax
$.support.cors = true;
$.ajax({
  url: 'https://api.npmjs.org/downloads/range/last-week/miniprogram-sm-crypto',
  dataType: 'json',
  success(data) {
    console.log('ajax success', data);
  },
  error() {
    console.log('ajax error');
  },
});