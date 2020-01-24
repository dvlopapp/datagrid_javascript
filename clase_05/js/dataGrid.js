(function ($) {

    $.fn.extend({

        dataGrid: function (opt) {

            let deffault = {
                columns: [],
                axions: [],
                regs: [10, 25, 80, 100],
                ajax: null,
                start: 0,
                display: 10,
                buttons: [],
                root: null
            };

            let options = $.extend(deffault, opt);

            let _private = {

                table: function (settings) {
                    let tb = $('<table/>');
                    tb.addClass('table table-bordered');
                    $(`#${settings.id}`).html(tb);

                    _private.theader(settings);

                    let tbody = $('<tbody/>');
                    $(`#${settings.id}`).find('table').append(tbody);

                    _private.tfoot(settings);
                },
                theader: function (settings) {
                    let thead = $('<thead/>');
                    let tr = $('<tr/>');

                    let th, field, width;

                    $.each(settings.columns, function (a, b) {
                        th = $('<th/>');
                        field = b.title;
                        width = b.width;
                        th.width(width);

                        th.html(field);
                        tr.append(th);
                    });

                    thead.html(tr);
                    $(`#${settings.id}`).find('table').html(thead);
                },
                tfoot: function (settings) {
                    let dfoot = $('<div/>');
                    dfoot.html(`
                    <div class="row">
                        <div class="col-sm-6">
                            ${_private.getInfo()}
                            <button class="btn btn-primary"><i class="fa fa-refresh"></i></button>
                        </div>
                        <div class="col-sm-6 _pagin">
                            <ul></ul>
                        </div>
                    </div>`);
                    dfoot.insertAfter(`#${settings.id} table`);
                },
                getInfo: function () {
                    return `${_private.txtIni} al ${_private.fin} de ${_private.total}`;
                },
                txtIni: 0,
                fin: 0,
                total: 0,
                getData: function (settings) {
                    let params = new FormData();
                    params.append('_start', settings.start);
                    params.append('_length', settings.display);
                    fetch(settings.root, {
                        method: 'POST',
                        body: params
                    }).then(function (data) {
                        return data.text();
                    }).then(function (data) {
                        data = JSON.parse(data);
                        settings.data = (data.length > 0) ? data : [];
                        _private.records(settings);
                    });
                },

                records: function (settings) {
                    let data = settings.data;
                    let tr, td;

                    if (data.length > 0) {
                        $.each(data, function (index, value) {
                            tr = $('<tr/>');
                            $.each(settings.columns, function (i, v) {
                                td = $('<td/>');
                                td.html(value[v.field]);
                                tr.append(td);
                            });
                            $(`#${settings.id}`).find('table').find('tbody').append(tr);
                        });
                    } else {

                    }
                }

            };

            return this.each(function () {
                let settings = options;
                settings.id = this.id;
                _private.table(settings);
                _private.getData(settings);

            });
        }

    });

})(jQuery);