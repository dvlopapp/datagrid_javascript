(function ($) {

    $.fn.extend({

        dataGrid: function (opt) {

            let deffault = {
                columns: [],
                axions: [],
                regs: [10, 25, 80, 100],
                start: 0,
                display: 10,
                buttons: [],
                root: null,
                itemsPagina: 5
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
                            <span class="_info">${_private.getInfo()}</span>
                            <button class="btn btn-primary"><i class="fa fa-refresh"></i></button>
                        </div>
                        <div class="col-sm-6">
                            <ul class="_pagin pagination pull-right"></ul>
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

                limit: function (settings) {
                    if (settings.start > 0) {
                        settings.start = settings.start * settings.display;
                    }
                },

                getData: function (settings) {

                    _private.limit(settings);

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
                        _private.pagination(settings);
                    });
                },

                records: function (settings) {
                    let data = settings.data;
                    let tr, td;

                    if (data.length > 0) {
                        $(`#${settings.id}`).find('table').find('tbody').html('');
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
                },

                pagination: function (settings) {
                    $(`#${settings.id}`).find('._pagin').html('');
                    let total = settings.data[0].total;
                    let start = (settings.start == 0) ? settings.start : settings.start / settings.display;
                    let length = settings.display;

                    let paginaActual = start + 1;
                    let numeroPaginas = Math.ceil(total / length);
                    let itemPaginas = settings.itemsPagina;

                    let pagInicio = start;
                    pagInicio = (pagInicio <= 0) ? 1 : pagInicio + 1;
                    let pagFinal = (pagInicio + itemPaginas) - 1;

                    let ini = ((paginaActual * length) - length) + 1;
                    let fin = paginaActual * length;

                    _private.txtIni = ini;
                    _private.fin = fin;
                    _private.total = total;

                    $(`#${settings.id}`).find('._info').html(_private.getInfo);


                    let i = pagInicio, liNumero;

                    for (i; i <= pagFinal; i++) {
                        if (i <= numeroPaginas) {
                            liNumero = $('<li/>');
                            liNumero.html(`<a href="javascript:;" class="page-link">${i}<a/>`);

                            if (i == paginaActual) {
                                liNumero.addClass('page-item');
                                liNumero.find('a').css({
                                    background: '#3276B1',
                                    color: '#ffffff',
                                    cursor: 'default'
                                });
                                $(`#${settings.id}`).find('._pagin').append(liNumero);
                            } else {
                                $(`#${settings.id}`).find('._pagin').append(liNumero);
                                liNumero.click(function () {
                                    settings.start = parseInt($(this).find('a').html()) - 1;
                                    _private.getData(settings);
                                });
                            }
                        } else {
                            break;
                        }
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