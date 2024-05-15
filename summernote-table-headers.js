/* https://github.com/tylerecouture/summernote-lists  */

(function (factory) {
    /* global define */
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jquery'], factory);
    } else if (typeof module === 'object' && module.exports) {
        // Node/CommonJS
        module.exports = factory(require('jquery'));
    } else {
        // Browser globals
        factory(window.jQuery);
    }
}(function ($) {

    // Extends plugins for emoji plugin.
    $.extend($.summernote.plugins, {

        'tableHeaders': function (context) {
            var self = this,
                ui = $.summernote.ui,
                options = context.options,
                lang      = options.langInfo,
                $note     = context.layoutInfo.note,
                $editor   = context.layoutInfo.editor,
                $editable = context.layoutInfo.editable;

            context.memo('button.tableHeaders', function () {
                return ui.buttonGroup([
                    ui.button({
                        container: options.container,
                        className: 'btn-md',
                        contents: '<b>H</b>', //ui.icon(options.icons.bold),
                        tooltip:  'Toggle table header',
                        click:function (e) {
                            self.toggleTableHeader();
                        }
                    }),
                ]).render();
            });

            this.toggleTableHeader = function () {
              const rng = context.invoke('createRange', $editable);
              const dom = $.summernote.dom;
              if (rng.isCollapsed() && rng.isOnCell()) {
                context.invoke('beforeCommand');
                var table = dom.ancestor(rng.commonAncestor(), dom.isTable)
                var $table = $(table);
                var $thead = $table.find('thead');
                if ($thead[0]) {
                  // thead found, so convert to a regular row.  When a header
                  // exists and user tries to add a new row below
                  // the header, Summernote actually adds another tr within the
                  // thead so need to capture all and move them into tbody
                  if(self.observer)
                     self.observer.disconnect(); // see below
                  self.replaceTags($thead.find('th'), 'td')
                  $thead.find('td').css('font-weight', '');
                  var $theadRows = $thead.find('tr');
                  $table.prepend($theadRows);
                  $thead.remove();
                }
                else { // thead not found, so convert top row to header row
                  var $topRow = $table.find('tr')[0];
                  $topRow.remove();

                  var $thead = $("<thead>");
                  $thead.prependTo($table);
                  $thead.append($topRow);
                  self.replaceTags($thead.find('td'), 'th')
                  $thead.find('th').css('font-weight', 'bold');

                  // Detect changes to the table dom so we can fix the header
                  // after rows or cols are added.  Summernote creates td's only

                  // https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver

                  // Options for the observer (which mutations to observe)
                  var config = { childList: true, subtree: true };
                  // Callback function to execute when mutations are observed
                  var callback = function(mutationsList) {
                    for(var mutation of mutationsList) {
                      self.replaceTags($(mutation.target).find('td'), 'th')
                    }
                  };
                  // Create an observer instance linked to the callback function
                  self.observer = new MutationObserver(callback);
                  // Start observing the target node for configured mutations
                  self.observer.observe($thead[0], config);

                  self.destroy = function () {
                    self.observer.disconnect();
                  };

                } // else

                context.invoke('afterCommand');
              }
            };

            this.replaceTags = function($nodes, newTag) {
              const attrs = this.recoverAttributes($nodes[0]);
              $nodes.replaceWith(function() {
                return $(`<${newTag} ${attrs}>${$(this).html()}</${newTag}>`);
              });
            }

            context.memo('button.tableBorders', function () {
              return ui.buttonGroup([
                ui.button({
                  container: options.container,
                  className: 'btn-md',
                  contents: '<b>B<b>', //ui.icon(options.icons.bold),
                  tooltip: 'Table border',
                  click: function (e) {
                    self.jBorderColor();
                  }
                }),
              ]).render();
            });
      
            this.jBorderColor = function () {
              const backColor = 'BLACK';
              const rng = context.invoke('createRange', $editable);
              const dom = $.summernote.dom;
      
              context.invoke('beforeCommand');
      
              var table = dom.ancestor(rng.commonAncestor(), dom.isTable)
              var $table = $(table);
      
              $table.find('th, td').css('border', '1px solid ' + backColor);
             
              context.invoke('afterCommand');
            };

            this.recoverAttributes= function(el) {
              let resultStr = '';
          
              if (!el) {
                return resultStr;
              }
          
              const attrList = el.attributes || [];
          
              for (let i = 0; i < attrList.length; i++) {
                if (attrList[i].name.toLowerCase() === 'id') {
                  continue;
                }
          
                if (attrList[i].specified) {
                  resultStr += ' ' + attrList[i].name + '=\'' + attrList[i].value + '\'';
                }
              }
          
              return resultStr;
            }
        }
    });
}));
