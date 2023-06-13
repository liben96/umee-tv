const logout = async () => {
  const res = await callAPI('GET', './apis/logout.php');
  if (res && res.success) {
    location.reload();
  }
};

const showToast = (success, body) => {
  let notiElem = $('#notification');
  $('#notification .toast-body').text(body);
  if (notiElem.hasClass('bg-success')) {
    notiElem.removeClass('bg-success');
  }
  if (notiElem.hasClass('bg-danger')) {
    notiElem.removeClass('bg-danger');
  }
  notiElem.addClass(success ? 'bg-success' : 'bg-danger');
  let bsAlert = new bootstrap.Toast(notiElem, {autohide: success});
  bsAlert.show();
};

const showInPageAlert = (id, type, message) => {
  // Remove other alert types class
  $(`#${id}`).removeClass((index, className) => (className.match(/(^|\s)alert-\S+/g) || []).join(' '));

  $(`#${id}`).addClass(`alert-${type}`);
  $(`#${id}-text`).html(message);
  if (message) $(`#${id}`).removeClass('d-none');
  else $(`#${id}`).addClass('d-none');
};

const mainLoader = (isStart) => {
  if (isStart) {
    $('#main-area').addClass('d-none');
    $('#main-loader').removeClass('d-none');
  } else {
    $('#main-area').removeClass('d-none');
    $('#main-loader').addClass('d-none');
  }
};

setupOnStopTypeEvent = (selector, event) => {
  let typingTimer,
    doneTypingInterval = 500;
  //on keyup, start the countdown
  $(selector).on('keyup', function () {
    clearTimeout(typingTimer);
    typingTimer = setTimeout(event, doneTypingInterval);
  });

  //on keydown, clear the countdown
  $(selector).on('keydown', function () {
    clearTimeout(typingTimer);
  });
};

const callAPI = (type, url, data) =>
  new Promise((resolve, reject) => {
    $.ajax({
      method: type,
      url,
      data,
      processData: false,
      contentType: false,
    })
      .then((res) => {
        if (res && res.success !== undefined) resolve({...res});
        else resolve({success: true, data: res});
      })
      .catch((e) => {
        resolve({success: false, data: e});
      });
  });

const loadMenu = async () => {
  const res = await callAPI('GET', './apis/get-dynamic-menu.php');
  if (res && res.success) {
    let finalMenu = [];
    res.data.forEach((item) => {
      if (item.parentId) {
        // find parent by id and push to it
        let parentIndex = finalMenu.findIndex((itemParent) => parseFloat(itemParent.id) === parseFloat(item.parentId));
        if (!finalMenu[parentIndex].child) finalMenu[parentIndex].child = [];
        finalMenu[parentIndex].child.push(item);
      } else if (item.childsTable) {
        let childTable = JSON.parse(item.childsTable);
        // Get child items from typesLists object
        let finalItem = {...item};
        finalItem.child = childTable.type
          ? typesLists[childTable.table].filter((typ) => parseFloat(typ.type) === childTable.type)
          : typesLists[childTable.table];
        finalMenu.push(finalItem);
      } else {
        finalMenu.push(item);
      }
    });
    let menuHTML = '<ul class="navbar-nav me-auto mb-2 mb-lg-0">';
    finalMenu.forEach((item) => {
      if (item.child) {
        menuHTML += `<li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown"
                aria-expanded="false">
                ${item.description}
            </a>
            <ul class="dropdown-menu">
              ${item.child
                .map(
                  (chld) =>
                    `<li><a class="dropdown-item" target="_blank" href=${chld.url || 'javascript:void(0)'}>${chld.description}</a></li>`,
                )
                .join('')}
            </ul>
        </li>`;
      } else {
        menuHTML += `<li class="nav-item">
            <a class="nav-link active" aria-current="page" target="${item.url && item.url.includes('http') ? '_blank' : '_self'}" href="${
          item.url || 'javascript:void(0)'
        }">${item.description}</a>
        </li>`;
      }
    });
    menuHTML += `</ul>`;
    $('#navbarScroll').append(menuHTML);
  } else showToast(false, (res && res.message) || 'Error while loading menu');
};

const unsecuredCopyToClipboard = (text) => {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    document.execCommand('copy');
  } catch (err) {
    console.error('Unable to copy to clipboard', err);
  }
  document.body.removeChild(textArea);
};

/**
 * Copies the text passed as param to the system clipboard
 * Check if using HTTPS and navigator.clipboard is available
 * Then uses standard clipboard API, otherwise uses fallback
 */
const copyClipboard = (content) => {
  if (window.isSecureContext && navigator.clipboard) {
    navigator.clipboard.writeText(content);
  } else {
    unsecuredCopyToClipboard(content);
  }
};
