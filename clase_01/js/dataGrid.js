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
            
            return this.each(function(){
                let settings = options;
                
                
                alert('mi grid')
            });
        }

    });

})(jQuery);