(function ($) {

    $.fn.extend({

        dataGrid: function (opt) {
            
            let deffault = {
                columns: [],
                axions: [],
                regs:[10,25,80,100],
                ajax: null,
                start: 0,
                display: 10,
                buttons: []
            };
            
            let options = $.extend(deffault,opt);
            
            let _private = {
                
                table: function(settings){
                    let tb = $('<table/>');
                    tb.addClass('table');
                    $(`#${settings.id}`).html(tb);
                    
                    _private.theader(settings);
                    
                    let tbody = $('<tbody/>');
                    $(`#${settings.id}`).find('table').append(tbody);
                    
                },
                theader: function(settings){
                    let thead = $('<thead/>');
                    let tr = $('<tr/>');
                    
                    let th,field,width;
                    
                    $.each(settings.columns,function(a,b){
                        th = $('<th/>');
                        field = b.field;
                        width = b.width;
                        th.width(width);
                        
                        th.html(field);
                        tr.append(th);
                    });
                     
                    thead.html(tr);
                    $(`#${settings.id}`).find('table').html(thead);
                }
                
            };
            
            return this.each(function(){
                let settings = options;
                settings.id = this.id;
                _private.table(settings);
                
            });
        }

    });

})(jQuery);