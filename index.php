<!doctype html>
<html lang="en">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>u-mee IPTV Management</title>

    <!-- styles start -->
    <link href="./assets/css/datatables.min.css" rel="stylesheet">
    </link>
    <link href="./assets/css/bootstrap.min.css" rel="stylesheet">
    </link>
    <link href="./assets/css/fontawesome/css/fontawesome.min.css" rel="stylesheet">
    <link href="./assets/css/fontawesome/css/brands.min.css" rel="stylesheet">
    <link href="./assets/css/fontawesome/css/solid.min.css" rel="stylesheet">
    <link href="./assets/css/style.css" rel="stylesheet">
    </link>
    <!-- styles end -->
</head>

<body>
    <div class="header">
        <img src="./assets/images/umee_smile_allwhite.png" class="umee-logo" alt="umee-logo">
        <nav>
            <ul>
                <li><a class="button" href="javascript:void(0)">Admin</a></li>
            </ul>
        </nav>
    </div>
    <div class="container-fluid">
        <div class="m-4">
            <!-- <div class="row mb-5">
                <div class="col">
                    <img src="./assets/images/umee.png" class="img-fluid" alt="umee-logo">
                </div>
                <div class="col d-flex justify-content-end align-items-center">
                    <a class="button" href="javascript:void(0)">Admin</a>
                </div>
            </div> -->
            <div class="row box">
                <div class="col">
                    <table class="table nowrap table-striped dt-responsive" id="tv-list" style="width:100%">
                    </table>
                </div>
            </div>
        </div>
    </div>

    <!-- notification -->
    <div id="notification-container" class="position-fixed">
        <div id="notification" class="toast align-items-center text-white border-0" role="alert" aria-live="assertive"
            aria-atomic="true">
            <div class="d-flex">
                <div class="toast-body"></div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"
                    aria-label="Close"></button>
            </div>
        </div>
    </div>

    <!-- Modal for channel edit -->
    <div id="edit-modal" class="modal fade">
        <div class="modal-dialog modal-dialog-centered modal-md">
            <div class="modal-content">
                <div class="modal-header">
                    <h1 class="modal-title fs-5" id="staticBackdropLabel">Edit Channel</h1>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <form id="edit-form">
                    <div class="modal-body">
                        <div class="row mb-3 d-none">
                            <label for="input_id" class="col-sm-3 col-form-label">ID</label>
                            <div class="col-sm-9">
                                <input type="text" class="form-control" id="input_id" readonly>
                            </div>
                        </div>
                        <div class="row mb-3 d-none">
                            <label for="input_name" class="col-sm-3 col-form-label">Channel Number*</label>
                            <div class="col-sm-9">
                                <input type="text" class="form-control" id="input_name" readonly>
                            </div>
                        </div>
                        <div class="row mb-3">
                            <label for="input_channelName" class="col-sm-3 col-form-label">Name*</label>
                            <div class="col-sm-9">
                                <input type="text" class="form-control" id="input_channelName" required>
                            </div>
                        </div>
                        <div class="row mb-3">
                            <label for="input_typeSourceId" class="col-sm-3 col-form-label">Source</label>
                            <div class="col-sm-9">
                                <input type="text" class="form-control" id="input_typeSourceId">
                            </div>
                        </div>
                        <div class="row mb-3">
                            <label for="input_typeOTTId" class="col-sm-3 col-form-label">OTT</label>
                            <div class="col-sm-9">
                                <input type="text" class="form-control" id="input_typeOTTId">
                            </div>
                        </div>
                        <div class="row mb-3">
                            <label for="input_ip" class="col-sm-3 col-form-label">IP</label>
                            <div class="col-sm-9">
                                <input type="text" class="form-control" id="input_ip">
                            </div>
                        </div>
                        <div class="row mb-3">
                            <label for="input_typePVIId" class="col-sm-3 col-form-label">PVI</label>
                            <div class="col-sm-9">
                                <input type="text" class="form-control" id="input_typePVIId">
                            </div>
                        </div>
                        <div class="row mb-3">
                            <label for="input_pviPort" class="col-sm-3 col-form-label">PVI Port</label>
                            <div class="col-sm-9">
                                <input type="text" class="form-control" id="input_pviPort">
                            </div>
                        </div>
                        <div class="row mb-3">
                            <label for="input_typePDUId" class="col-sm-3 col-form-label">PDU</label>
                            <div class="col-sm-9">
                                <input type="text" class="form-control" id="input_typePDUId">
                            </div>
                        </div>
                        <div class="row mb-3">
                            <label for="input_pduPort" class="col-sm-3 col-form-label">PDU Port</label>
                            <div class="col-sm-9">
                                <input type="text" class="form-control" id="input_pduPort">
                            </div>
                        </div>
                        <div class="row mb-3">
                            <label for="input_box" class="col-sm-3 col-form-label">Box</label>
                            <div class="col-sm-9">
                                <input type="text" class="form-control" id="input_box">
                            </div>
                        </div>
                        <div class="row mb-3">
                            <label for="input_rack" class="col-sm-3 col-form-label">Rack</label>
                            <div class="col-sm-9">
                                <input type="text" class="form-control" id="input_rack">
                            </div>
                        </div>
                        <div class="row mb-3">
                            <label for="input_cardNumber" class="col-sm-3 col-form-label">Card Number</label>
                            <div class="col-sm-9">
                                <input type="text" class="form-control" id="input_cardNumber">
                            </div>
                        </div>
                        <div class="row mb-3">
                            <label for="input_cardNumberExpiry" class="col-sm-3 col-form-label">Card Expiry</label>
                            <div class="col-sm-9">
                                <input type="text" class="form-control" id="input_cardNumberExpiry">
                            </div>
                        </div>
                        <div class="row mb-3">
                            <label for="input_typeEscalationId" class="col-sm-3 col-form-label">Escalation</label>
                            <div class="col-sm-9">
                                <input type="text" class="form-control" id="input_typeEscalationId">
                            </div>
                        </div>
                        <div class="row mb-3">
                            <label for="input_priority" class="col-sm-3 col-form-label">Priority</label>
                            <div class="col-sm-9">
                                <input type="checkbox" class="form-check-input" id="input_priority">
                            </div>
                        </div>
                        <div class="row mb-3">
                            <label for="input_enabled" class="col-sm-3 col-form-label">Enabled</label>
                            <div class="col-sm-9">
                                <input type="checkbox" class="form-check-input" id="input_enabled">
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="submit" class="btn btn-primary">Save</button>
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <!-- scripts start -->
    <script src="./assets/js/jquery-3.7.0.min.js"></script>
    <script src="./assets/js/jquery.validate.min.js"></script>
    <script src="./assets/js/bootstrap.bundle.min.js"></script>
    <script src="./assets/js/datatables.min.js"></script>
    <script src="./assets/js/moment.min.js"></script>
    <script src="./src/app.js"></script>
    <!-- scripts end -->
</body>

</html>