var tablesort = require('tablesort');

window.addEventListener('load', function() {
    if (document.getElementById('report')) {
        tablesort(document.getElementById('report'));
    }

    var collapses = document.getElementsByClassName('collapsey');

    if (collapses) {
      for (var i = 0; i < collapses.length; i++) {
        let collapse = collapses[i];

        collapse.addEventListener('click', function() {
          var target = collapse.getAttribute('data-target');
          var targetElement = document.getElementById(target);

          if (!target || !targetElement) {
            return false;
          }

          if (collapse.getAttribute('data-collapsed') === 'false') {
            targetElement.style.display = 'none';
            collapse.innerText = collapse.getAttribute('data-collapsed-text');
            collapse.className = 'btn btn-success';
            collapse.setAttribute('data-collapsed', 'true');
          } else {
            targetElement.style.display = '';
            collapse.innerText = collapse.getAttribute('data-open-text');
            collapse.className = 'btn btn-danger';
            collapse.setAttribute('data-collapsed', 'false');
          }
        });
      }
    }

    //FFS - https://github.com/tristen/tablesort/issues/94

    /*!
     * tablesort v5.0.2 (2017-11-12)
     * http://tristen.ca/tablesort/demo/
     * Copyright (c) 2017 ; Licensed MIT
    */!function(){var a=function(a){return a.replace(/[^\-?0-9.]/g,"")},b=function(a,b){return a=parseFloat(a),b=parseFloat(b),a=isNaN(a)?0:a,b=isNaN(b)?0:b,a-b};tablesort.extend("number",function(a){return a.match(/^[-+]?[£\x24Û¢´€]?\d+\s*([,\.]\d{0,2})/)||a.match(/^[-+]?\d+\s*([,\.]\d{0,2})?[£\x24Û¢´€]/)||a.match(/^[-+]?(\d)*-?([,\.]){0,1}-?(\d)+([E,e][\-+][\d]+)?%?$/)},function(c,d){return c=a(c),d=a(d),b(d,c)})}();
});


