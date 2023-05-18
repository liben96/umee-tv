/// <reference path="../assets/js/jquery-3.7.0.min.js" />

let channelList = [];
const callAPI = (type, url, data) =>
  new Promise((resolve, reject) => {
    $.ajax({
      method: type,
      url,
      data,
    })
      .then((res) => {
        resolve({success: true, data: res});
      })
      .catch((e) => {
        resolve({success: false, data: e});
      });
  });

const initTable = (data) => {
  if ($('#tv-list').destroy) $('#tv-list').destroy();
  $('#tv-list').dataTable({
    data,
    responsive: true,
    columns: [
      {
        data: 'logo',
        title: '',
        orderable: false,
        className: 'align-middle text-center',
        render: (data, type, row) => `<div><img src="./assets/images/logos/${row.logo}" class="channel-logo" /><div>`,
      },
      {data: 'name', title: 'Number', className: 'align-middle'},
      {data: 'channelName', title: 'Name', className: 'align-middle'},
      {data: 'sourceType', title: 'Source', className: 'align-middle'},
      {data: 'typeOTT', title: 'OTT', className: 'align-middle'},
      {data: 'ip', title: 'IP', className: 'align-middle'},
      {
        data: 'typePVI',
        title: 'PVI',
        render: (data, type, row) =>
          `<div><div> ${row.typePVI}</div>${
            row.pviPort ? `<div class="text-secondary" style="font-size:0.8rem">Port: ${row.pviPort}</div>` : ''
          }<div>`,
        className: 'align-middle',
      },
      {
        data: 'typePDU',
        title: 'PDU',
        render: (data, type, row) =>
          `<div><div> ${row.typePDU}</div>${
            row.pduPort ? `<div class="text-secondary" style="font-size:0.8rem">Port: ${row.pduPort}</div>` : ''
          }<div>`,
        className: 'align-middle',
      },
      {data: 'box', title: 'Box', className: 'align-middle'},
      {data: 'rack', title: 'Rack', className: 'align-middle'},
      {data: 'cardNumber', title: 'Card Number', className: 'align-middle'},
      {data: 'typeEscalation', title: 'Escalation', className: 'align-middle'},
      {data: 'priority', title: 'Priority', className: 'align-middle'},
      {data: 'enabled', title: 'Enabled', className: 'align-middle'},
      {
        data: 'disabled',
        title: 'Status',
        className: 'text-center align-middle',
        render: (data, type, row) =>
          `<div class="text-center"><div class="${!row.disabled ? 'text-success' : 'text-secondary'}"><i class="fa-solid fa-circle"></i> ${
            row.disabled ? 'Disabled' : 'Online'
          }</div>${row.uptime ? `<div class="text-secondary text-right" style="font-size:0.8rem">${row.uptime}</div>` : ''}<div>`,
      },
      {
        data: 'typeEscalation',
        title: 'Actions',
        orderable: false,
        searchable: false,
        className: 'text-center align-middle',
        render: (data, type, row) =>
          `<div class="text-center">${
            !row.disabled ? `<a class="me-2" href="javascript:void(0)"><i class="fa-solid fa-arrows-rotate"></i></a>` : ''
          }<a href="javascript:void(0)" onclick="openEditModal(${row.name})"><i class="fa-solid fa-pen"></i></a><div>`,
      },
    ],
    order: [[1, 'asc']],
    pageLength: 10,
  });
};

const calculateUptime = (startDate) => {
  const currentDate = new Date();
  const timeDifference = currentDate.getTime() - startDate;

  // Calculate days, hours, and minutes
  const millisecondsPerMinute = 1000 * 60;
  const millisecondsPerHour = millisecondsPerMinute * 60;
  const millisecondsPerDay = millisecondsPerHour * 24;

  const days = Math.floor(timeDifference / millisecondsPerDay);
  const hours = Math.floor((timeDifference % millisecondsPerDay) / millisecondsPerHour);
  const minutes = Math.floor((timeDifference % millisecondsPerHour) / millisecondsPerMinute);

  // Construct the uptime string
  let uptimeString = '';
  if (days > 0) {
    uptimeString += days + 'd';
  }
  if (hours > 0) {
    uptimeString += ' ' + hours + 'h';
  }
  // if (minutes > 0) {
  //   uptimeString += ' ' + minutes + 'm';
  // }

  return uptimeString;
};

const fetchChannelList = async () => {
  const res = await callAPI('GET', './apis/get-channel-list.php');
  if (res.success) {
    // Get data from flusonic
    const resFluSonic = await callAPI('GET', './apis/flusonic_response.json');
    if (resFluSonic.success) {
      let finalArray = res.data.map((item) => {
        // Find and get disabled and uptime by comparing name field
        let foundSonicChannel = resFluSonic.data.streams.find((itemFluSonic) => itemFluSonic.name === item.name);
        if (foundSonicChannel)
          return {...item, disabled: foundSonicChannel.disabled, uptime: calculateUptime(foundSonicChannel.stats.opened_at)};
        else return item;
      });
      channelList = finalArray;
      initTable(finalArray);
    }
  }
};

const openEditModal = (channelName) => {
  let selectedChannel = channelList.find((item) => channelName.toString() === item.name);
  console.log(selectedChannel);
  const myModalAlternative = new bootstrap.Modal('#edit-modal');
  myModalAlternative.toggle();
};

// const submitEditForm = () => {
//   console.log(
//     $('#edit-form').validate({
//       errorClass: 'd-none',
//       highlight: function (element) {
//         $(element).addClass('border border-danger');
//       },
//       unhighlight: function (element) {
//         $(element).removeClass('border border-danger');
//       },
//     }),
//   );
// };

$(() => {
  fetchChannelList();
  // $('#edit-form').on('submit', () => {
  //   submitEditForm();
  // });
});
