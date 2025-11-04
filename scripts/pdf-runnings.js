
      exports.header = {
        height: '2cm',
        contents: function(pageNum, numPages) {
          if (pageNum === 1) return '';
          return '<div style="text-align: right; font-size: 10pt; color: #777;">MPAAI CSMP Proposal</div>';
        }
      };
      
      exports.footer = {
        height: '2cm',
        contents: function(pageNum, numPages) {
          if (pageNum === 1) return '';
          return '<div style="text-align: center; font-size: 10pt; color: #777;">Page ' + pageNum + ' of ' + numPages + '</div>';
        }
      };