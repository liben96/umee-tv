/// <reference path="../assets/js/jquery-3.7.0.min.js" />

let channelList = [],
  formValidator,
  selectedChannel;
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
    responsive: {
      details: {
        display: $.fn.dataTable.Responsive.display.modal({
          header: function (row) {
            var data = row.data();
            return data.channelName;
          },
        }),
        renderer: $.fn.dataTable.Responsive.renderer.tableAll({
          tableClass: 'table col-details',
        }),
      },
    },
    columns: [
      {data: 'id', title: 'ID', className: 'align-middle', visible: false},
      {
        data: 'name',
        title: '',
        className: 'align-middle',
        orderable: false,
        render: (data, type, row) =>
          `<div class="text-center">${row.logo ? `<img src="./assets/images/logos/${row.logo}" class="channel-logo" />` : ''}<div>`,
      },
      {
        data: 'channelName',
        title: 'Channel',
        className: 'align-middle',
        render: (data, type, row) => `<div><div> ${row.name}</div>${`<div>${row.channelName}</div>`}<div>`,
      },
      {data: 'sourceType', title: 'Source', className: 'text-center align-middle', width: '42px'},
      {data: 'typeOTT', title: 'OTT', className: 'text-center align-middle'},
      {data: 'ip', title: 'IP', className: 'text-center align-middle', width: '46px'},
      {
        data: 'typePVI',
        title: 'PVI',
        render: (data, type, row) =>
          row.typePVI ? `<div><div> ${row.typePVI}</div>${row.pviPort ? `<div><u>Port</u>: ${row.pviPort}</div>` : ''}<div>` : '',
        className: 'align-middle',
      },
      {
        data: 'typePDU',
        title: 'PDU',
        width: '35px',
        render: (data, type, row) => `<div><div> ${row.typePDU}</div>${row.pduPort ? `<div><u>Port</u>: ${row.pduPort}</div>` : ''}<div>`,
        className: 'align-middle',
      },
      {
        data: 'cardNumber',
        title: 'Info',
        render: (data, type, row) =>
          `<div>${row.box ? `<div><u>Box</u>: ${row.box} <u>Rack</u>: ${row.rack}</div>` : ''}${
            row.cardNumber ? `<div><u>Card Number</u>: ${row.cardNumber}</div>` : ''
          }${row.cardNumberExpiry ? `<div><u>Expiry</u>: ${moment(row.cardNumberExpiry).format('DD MMMM YYYY')}</div>` : ''}<div>`,
        className: 'align-middle',
      },
      {data: 'typeEscalation', title: 'Escalation', className: 'text-center align-middle', width: '62px'},
      {
        data: 'priority',
        title: 'Priority',
        className: 'text-center align-middle',
        width: '44px',
        render: (data, type, row) =>
          `<div class="text-center">${
            parseInt(row.priority) ? `<input type="checkbox" checked disabled>` : `<input type="checkbox" disabled>`
          }<div>`,
      },
      {
        data: 'enabled',
        title: 'Enabled',
        className: 'text-center align-middle',
        width: '49px',
        render: (data, type, row) =>
          `<div class="text-center">${
            parseInt(row.enabled) ? `<input type="checkbox" checked disabled>` : `<input type="checkbox" disabled>`
          }<div>`,
      },
      {
        data: null,
        title: 'Status',
        className: 'text-center align-middle all',
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
        className: 'text-center align-middle hide-in-details all',
        width: '46px',
        render: (data, type, row) =>
          `<div class="text-center">${
            !row.disabled ? `<a class="me-2" href="javascript:void(0)"><i class="fa-solid fa-arrows-rotate"></i></a>` : ''
          }<a href="javascript:void(0)" onclick="openEditModal(${row.id})"><i class="fa-solid fa-pen"></i></a><div>`,
      },
    ],
    order: [[2, 'asc']],
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

const openEditModal = (id) => {
  selectedChannel = channelList.find((item) => id === parseFloat(item.id));
  Object.keys(selectedChannel).forEach((key) => {
    if (key === 'enabled' || key === 'priority') {
      // Setting all text inputs
      $(`#edit-form #input_${key}`).prop('checked', parseInt(selectedChannel[key]) ? true : false);
    } else {
      // Setting all text inputs
      $(`#edit-form #input_${key}`).val(selectedChannel[key]);
    }
    // Setting other inputs menually
  });
  formValidator.resetForm();
  const myModalAlternative = new bootstrap.Modal('#edit-modal');
  myModalAlternative.toggle();
};

const submitEditForm = (e) => {
  if (formValidator.valid()) {
    let body = {
      id: null,
      name: null,
      channelName: null,
      sourceType: null,
      typeOTT: null,
      ip: null,
      typePVI: null,
      pviPort: null,
      typePDU: null,
      pduPort: null,
      box: null,
      rack: null,
      cardNumber: null,
      cardNumberExpiry: null,
      typeEscalation: null,
      priority: null,
      enabled: null,
    };

    //Getting new values from form
    Object.keys(body).forEach((key) => {
      if (key === 'enabled' || key === 'priority') {
        body[key] = $(`#edit-form #input_${key}`).is(':checked');
      } else {
        body[key] = $(`#edit-form #input_${key}`).val();
      }
    });

    console.log('body', body);
    if (body.id && body.name) {
      // Call API
    }
  }
};

$(() => {
  fetchChannelList();
  $('#edit-form').on('submit', (e) => {
    e.preventDefault();
    submitEditForm();
  });

  formValidator = $('#edit-form').validate({
    errorClass: 'd-none',
    highlight: function (element) {
      $(element).addClass('border border-danger');
    },
    unhighlight: function (element) {
      $(element).removeClass('border border-danger');
    },
  });
});
