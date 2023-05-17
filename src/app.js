/// <reference path="../assets/js/jquery-3.7.0.min.js" />

$(() => {
  const initTable = (data) => {
    if ($('#tv-list').destroy) $('#tv-list').destroy();
    $('#tv-list').dataTable({
      data,
      columns: [
        {data: 'name', title: 'Number'},
        {data: 'channelName', title: 'Name'},
        {data: 'ip', title: 'IP'},
        {
          data: 'typePVI',
          title: 'PVI',
          render: (data, type, row) => `${row.typePVI || ''}${row.pviPort ? ' :' + row.pviPort : ''}`,
        },
        {data: 'sourceType', title: 'Source'},
        {data: 'cardNumber', title: 'Card Number'},
        {data: 'typeOTT', title: 'OTT'},
        {data: 'box', title: 'Box'},
        {data: 'rack', title: 'Rack'},
        {data: 'typeEscalation', title: 'Escalation'},
        {
          data: 'typeEscalation',
          title: 'Actions',
          orderable: false,
          searchable: false,
          render: (data, type, row) => `<div class="text-center"><a href="javascript:void(0)"><i class="fa-solid fa-pen"></i></a><div>`,
        },
      ],
      order: [[1, 'asc']],
      pageLength: 10,
    });
  };

  const fetchChannelList = () => {
    $.ajax({
      method: 'GET',
      url: './apis/get-channel-list.php',
    })
      .then((res) => {
        initTable(res);
      })
      .catch((e) => {
        console.log(e);
      });
  };
  fetchChannelList();
});
