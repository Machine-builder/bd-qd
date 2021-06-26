
function stringifyPrice(price) {
    var sprice = String(price);
    if (!sprice.includes('.')) {
        sprice += '.00';
    } else if (sprice.includes('.')) {
        var split_sprice = sprice.split('.');
        var before_dot = split_sprice[0];
        var after_dot = split_sprice[1];

        if (after_dot === undefined) {
            after_dot = '00';
        }
        if (after_dot.length == 1) {
            after_dot += '0';
        }
        sprice = before_dot+'.'+after_dot;
    }
    return sprice;
}

window.onload = function() {
    console.log('window ready');

    var buying_options_elem = document.getElementById("buying-options");

    for (var i=0; i<buying_options.length; i++) {
        var option = buying_options[i];
        var name = option['name'];
        var desc = option['description'];
        var price = option['price'];

        var strPrice = stringifyPrice(price);

        var child_html = `\
            <div class="col-md-6 no-select" id="buying-option-`+String(i)+`">
                <div class="pack-preview d-flex flex-row">
                    <div class="p-2" onclick="toggle_buying_option(`+String(i)+`)">
                        <h2 class="pack-title"><span class="module-price">[USD$`+strPrice+`]</span> `+name+`</h2>
                        <p class="pack-description">
                        `+desc+`
                        </p>
                    </div>
                    
                    <div class="pack-configure-cog p-2">
                        <i onclick="clicked_info_button(`+String(i)+`)" class="fa fa-info-circle" aria-hidden="true"></i>
                        <i onclick="toggle_buying_option(`+String(i)+`)" class="fa fa-toggle-off" aria-hidden="true"></i>
                    </div>
                </div>
            </div>`;

        buying_options_elem.insertAdjacentHTML('beforeend', child_html)
    };

    refresh_purchase_code();
}

var toggled_info_box = undefined;
var sliding_animation = false;

function div_slide_up() {
    sliding_animation = true;
    var dropdown_div = document.getElementById('module-info-dropdown-div');
    dropdown_div.style.animation = "slide_div_up 0.7s";
    dropdown_div.style.transform = "translate(-50%, -110%)";
    window.setTimeout(function() {
        sliding_animation = false;
    }, 700)
}
function div_slide_down() {
    sliding_animation = true;
    var dropdown_div = document.getElementById('module-info-dropdown-div');
    dropdown_div.style.animation = "slide_div_down 0.7s";
    dropdown_div.style.transform = "translate(-50%, 15px)";
    window.setTimeout(function() {
        sliding_animation = false;
    }, 700)
}

function hide_info_box() {
    toggled_info_box = undefined;
    div_slide_up();
}

function reload_dropdown_div() {
    var module_info = buying_options[toggled_info_box];
    var module_name = module_info['name'];
    var module_desc = module_info['description'];
    var module_price = module_info['price'];
    var module_desc_long = module_info['long_description'];

    var dropdown_html = `
        <div class="pack-configure-cog white p-2" onclick="hide_info_box()">
            <i class="fa fa-window-close" aria-hidden="true"></i>
        </div>

        <div class="title-icon p-2 container" style="margin-left:12px;">
            <img src="./icons/256x256_transparent.png" class="title-icon"></img>
        </div>
        <h2 class="pack-title">
            <span class="module-price dark">USD$`+stringifyPrice(module_price)+`</span>
            <br>
            `+module_name+`</h2>
        <p class="pack-description">
        `+module_desc+`
        </p>
        
        <span class="pack-description-long">`+module_desc_long+`</span>
        `;
    
    var dropdown_div = document.getElementById('module-info-dropdown-div');
    dropdown_div.innerHTML = dropdown_html
}

function clicked_info_button(index) {

    if (sliding_animation) {
        return
    }

    if (toggled_info_box === undefined) {
        toggled_info_box = index;
        reload_dropdown_div();
        div_slide_down();
    } else if (toggled_info_box != index) {
        toggled_info_box = index;
        div_slide_up();
        window.setTimeout(function() {
            reload_dropdown_div();
            div_slide_down();
        }, 600)
    } else {
        toggled_info_box = undefined;
        div_slide_up();
    }
}

function toggle_buying_option(index) {

    // update the total price

    var toggled = !buying_options[index]['toggled'];

    buying_options[index]['toggled'] = toggled;

    var elem_id = "buying-option-"+String(index);
    var buying_option_elem = document.getElementById(elem_id);
    var icon_elem = buying_option_elem.children[0].children[1].children[1];
    
    if (toggled) {
        icon_elem.classList.remove('fa-toggle-off');
        icon_elem.classList.add('fa-toggle-on');
    } else {
        icon_elem.classList.remove('fa-toggle-on');
        icon_elem.classList.add('fa-toggle-off');
    };

    var total_price = 0
    var selected_options = 0
    for (var i=0; i<buying_options.length; i++) {
        var option = buying_options[i];
        var name = option['name'];
        var toggled = option['toggled'];
        var price = option['price'];
        if (toggled) {
            total_price += price;
            selected_options += 1;
        };
    };

    total_price = Math.round(total_price*100)/100;
    var total_price_str = "USD$"+stringifyPrice(total_price);

    var order_sum = document.getElementById('order-summary');
    order_sum.innerHTML = `You have selected `+String(selected_options)+`/4 options`;
    document.getElementById("total-cost").innerText = total_price_str

    refresh_purchase_code();
}

function refresh_purchase_code() {
    var purchase_info = {
        "module_uids": []
    }

    for (var i=0; i<buying_options.length; i++) {
        var option = buying_options[i];
        var toggled = option['toggled'];
        if (toggled) {
            purchase_info['module_uids'].push(option['uid']);
        }
    };

    purchase_code = JSON.stringify(purchase_info);

    var purchase_code_b64 = btoa(purchase_code);
    document.getElementById('purchase-code').innerText = purchase_code_b64;
}

function copy_text(text) {
    new_elem = document.createElement("input");
    new_elem.id = "tmp-copy-text";
    document.body.appendChild(new_elem);
    new_elem.value = text;
    new_elem.select();
    new_elem.setSelectionRange(0, 999999);
    document.execCommand("copy");
    document.body.removeChild(new_elem);
}

function copy_purchase_code() {
    var purchase_code = document.getElementById('purchase-code');
    copy_text(purchase_code.innerText);

    // change button color quickly
    document.getElementById("copy-purchase-code-button").style.backgroundColor = "rgb(23, 184, 109)";
    window.setTimeout(function() {
        document.getElementById("copy-purchase-code-button").style.backgroundColor = "rgb(23, 162, 184)";
    }, 800)
}