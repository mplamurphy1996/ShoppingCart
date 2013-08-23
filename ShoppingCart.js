$(document).ready(function() {

    /*** User Events ***/
    /* Initialize Page */
    $(".cart-header-title").on("click", function() {
        // populate the cart with sample data
        initTestData();
        UpdateCartPage(_salescart);
    });

    /* Delete Item */
    $(".delete").on("click", function() {
        // delete a row from the cart
        var idx = GetSelectedRowNumber(this); //1th element
        DeleteItemInCart(_salescart, idx-1);
        UpdateCartPage(_salescart);
    });
    
    /* Hold Item (Put on Layaway)*/
    $(".hold").on("click", function() {
        // put row item on layaway (putting on hold)
        var idx = GetSelectedRowNumber(this); //1th element
        ToggleHoldItemInCart(_salescart, idx-1);
        UpdateCartPage(_salescart);
    });
    
    /* Edit Item */
    $(".edit").on("click", function() {
        //alert("Edit the row item. Replace report row with editbox row.");
        TEST_DEBUG("editboxin", this);
    });

    /* Update Item */
    $(".update").on("click", function() {
        //alert("Accept the Edit. Replace the editbox row with the report row. \n\n RIGHT NOW: TESTING ITEM ADDS!!!");
        if (InEditMode()) {
            TEST_DEBUG("editboxout_editrow", _selectedRow);
        } else {
            TEST_DEBUG("editboxout_addrow", ($(this).closest(".page-section").find(".edit")));
        }
    });

    /* Cancel Item */
    $(".cancel").on("click", function() {
        //alert("Cancel the Edit. Replace the editbox row with the report row.");
        TEST_DEBUG("editboxout_cancel");
    });
    
    /* Proceed to Checkout */
    $(".proceed").on("click", function() {
        ProceedToCheckout();
    });
 
    /*** shopping cart data definition ***/
        /* SELECTION MODE CONTROL */
    /* static data */
    var MODE_ADD = "Add";       //DEFAULT TEXT
    var MODE_UPDATE = "Update";
    var DEF_DESC = "Enter Item here";
    var DEF_PRICE = 0;
    var DEF_QTY = 1;
    var DEF_STATE = "TX";
    var DEF_RATE = 6.25;
    
    function SaleItem(desc, price, quan, hold) {
        this.description = desc;
        this.unitprice = price;
        this.quantity = quan;
        this.onhold = hold;
    };
    //var _defaultitem = new SaleItem(DEF_DESC, DEF_PRICE, DEF_QTY, false);
    
    function SalesCart(items, state, rate) {
        this.salesitems = items;
        this.taxstate = state;
        this.taxrate = rate;
    };
    
    /* THE CART !!!*/
    //var _salescart = new SalesCart(new SaleItem(DEF_DESC, DEF_PRICE, DEF_QTY, false), DEF_STATE, DEF_RATE); // init with no list
    //var _salescart = new SalesCart(new Array(_defaultitem), DEF_STATE, DEF_RATE); // init with no list
    var _salescart = new SalesCart(new Array(), DEF_STATE, DEF_RATE); // init with no list
    
    // When row is selected, we reference here. We will determine editmode by the state of this pointer
    var _selectedRow = null;     
    
    /*
    shopping cart data control functions
    */
    /* Returns whether or not cart has items */
    function hasItems(cart) {
        if (cart != null) {
            if (cart.salesitems != null) {
                if (cart.salesitems.length > 0) {
                    return true;
                }
            }
        }
        return false; // no items
    }
    
    function GetItemInCart(cart, i) {
        if (hasItems(cart) && (cart.salesitems.length > i)) {
            return cart.salesitems[i];
        }
        else return null;
    }
    
    /* Add the SaleItem to the cart at the back */
    function AddItemToCart(cart, item) {
        if (cart.salesitems==null)
            cart.salesitems = new Array();
            
        cart.salesitems.push(item);
    }
    
    /* Edit the SaleItem in the cart. pass in 0-th element */
    function EditItemInCart(cart, i, item) {
        var initem = GetItemInCart(cart, i);
        if (initem!=null) {
            cart.salesitems[i].description = item.description;
            cart.salesitems[i].unitprice = item.unitprice;
            cart.salesitems[i].quantity = item.quantity;
            cart.salesitems[i].onhold = item.onhold;
        }
    }
    
    /* Delete the SaleItem from the cart. pass in 0-th element */
    function DeleteItemInCart(cart, i) {
        var initem = GetItemInCart(cart, i);
        if (initem!=null) {
            cart.salesitems.splice(i, 1); // reomve 1 item @ ith pos
        }
    }
    
    /* Holds the SaleItem from the cart. pass in 0-th element */
    function HoldItemInCart(cart, i, onhold) {
        var initem = GetItemInCart(cart, i);
        if (initem!=null) {
            cart.salesitems[i].onhold = onhold; // set hold value
        }
    }
    /* Toggles Hold flag on the SaleItem from the cart. pass in 0-th element */
    function ToggleHoldItemInCart(cart, i) {
        var initem = GetItemInCart(cart, i);
        if (initem!=null) {
            cart.salesitems[i].onhold = !cart.salesitems[i].onhold; // set hold value
        }
    }
    
    /***
    shopping cart html control functions
    ***/
    function InEditMode() {
        return (_selectedRow != null); //$(".cart-template").find(".update").text();
    }
    
    /* Set any style options to determine of we are in edit mode or add row (default) mode */
    function SetEditStyle(editmode) {
        // set edit button text
        $(".cart-edit").find(".update").text((editmode) ? MODE_UPDATE : MODE_ADD);
        
        // stylize the editing row
        (editmode) ? _selectedRow.css({"background" : "#f24242", "color" : "#ffffff" }) :   // pink 
                        _selectedRow.css({"background" : "#ffffff", "color" : "#000000"  }) // white
          
        // set ALL buttons on or off
        SetRowButtonVisibility(_selectedRow, !editmode, !editmode, !editmode);
    }
    
    /* For future work: Popup to user telling them what they owe */
    function ProceedToCheckout() {
        var purchase = getPurchaseTotal(_salescart, false);
        alert("Thank you for shopping with MisterPouch. \n\nThat'll be $"+ purchase.toFixed(2) + ", please! \n\n(Future): Directed to payment page.");
    }
    
    /* refresh cart table with sales cart data */
    function UpdateCartPage(cart) {
        ClearItemList(true); // remove all rows
        AddItemListToPageList(cart.salesitems); // add all rows from data
        UpdateTotalsToPage(cart, false); // updated totals
    }
    
    function GetEditRow(anelement) {
        if (anelement!=null) {
            return ($(anelement).closest(".edited"));
        }
        return null; // no row found
    }
    
    /* pass any element: Get row element */
    function GetSelectedRow(anelement) {
        if (anelement!=null) {
            return ($(anelement).closest(".viewed"));
        }
        return null; // no row found
    }
    /* pass any element: Get 1-th row number */
    function GetSelectedRowNumber(rowelement) {
        var rownum = -1;
        if (rowelement!=null) {
            var row = GetSelectedRow(rowelement);
            if (row!=null) {
                var topparent = ($(rowelement).closest(".page-section"));
                rownum = ($(topparent).children().index(row) + 1);
            }
        }
        return rownum;
    }
    
    /* pass in 0-th element */
    function GetPageRow(index) {
        if ((index>= 0) && (index < GetPageRowCount())) {
            var ctlstr = "div.cart-list div.viewed:eq(" + index + ")";
            //var ctlstr = "div.page-section div.viewed:eq(" + index + ")";
            return $(ctlstr);
        }
        else return null;
    }
    function GetPageRowCount() {
        return $(".cart-list").children().length;
    }
    
    function UpdateTotalsToPage(cart, includehold) { 
        $(".cart-total").find(".total-taxstate").text(cart.taxstate + " @ " + cart.taxrate.toFixed(2) + "%");       
        $(".cart-total").find(".total-subtotals").text("$" + getSubTotal(cart, includehold).toFixed(2));       
        $(".cart-total").find(".total-tax").text("$" + getTax(cart, includehold).toFixed(2));
        $(".cart-total").find(".total-purchase").text("$" + getPurchaseTotal(cart, includehold).toFixed(2));
    }

    function ClearItemList() {
        $(".cart-list").children().remove();
    }
    
    function AddItemListToPageList(items) {
        if ((items!=null) && (items.length > 0)) {
            for (i=0; i<items.length; i++) {
                AddItemToPageListRow(items[i]);
            }
        }
    }
    function ClearPageRow(pagerow) {
        $(".cart-list").find(pagerow).remove();
    }
    
    function AddItemToPageListRow(item) {
        if (item!=null) {
            var pagerow = $(".cart-template").children(":first").clone(true);
            pagerow = CopyItemToPageRow(item, pagerow);
            pagerow.appendTo(".cart-list");              
        }
    }
 
    function CopyPageRowToItem(pagerow, item) {
         if (pagerow!=null) {
            //allow item creation on-the-fly, or elsewhere. Values will be overridden anyway
            if (item == null) {
                item = new SaleItem(null, null, null, null); 
            }
            item.description = pagerow.find(".item").text();
            item.unitprice = GetFloatFromCurrency(pagerow.find(".unitprice").text());
            item.quantity = parseInt(pagerow.find(".quantity").text());
            item.onhold = false; ///pagerow.is("onhold") ? true : false; ///NEED TO FIGURE WHAT HTML/CSS ELEMENT HOLDS THIS!
        }
        
        return item;
    }
    
    function CopyItemToPageRow(item, pagerow) {
        if ((item!=null) && (pagerow!=null)) { //not creating pagerow on the fly. do via clone() elsewhere
            pagerow.find(".item").text(item.description);
            pagerow.find(".unitprice").text("$"+item.unitprice.toFixed(2));
            pagerow.find(".quantity").text(item.quantity);
            pagerow.find(".subtotal").text("$"+getItemTotal(item).toFixed(2));
            SetHoldtoPageRow(item.onhold, pagerow);
        }
        
        return pagerow;
    }
    
    function CopyEditRowToItem(editrow, item) {
         if (editrow!=null) {
            //allow item creation on-the-fly, or elsewhere. Values will be overridden anyway
            if (item == null) {
                item = new SaleItem(null, null, null, null); 
            }
            // looking for input boxes. special handling
            var ctl = null, txt = null;
            
            ctl = editrow.find(".edititem");   //description         
            item.description = ctl.val();
            
            ctl = editrow.find(".editunitprice"); // unit price
            item.unitprice = parseFloat(ctl.val()); //already in floating pt
            
            ctl = editrow.find(".editquantity"); // quantity
            item.quantity = parseInt(ctl.val());
            
            ctl = editrow.find(".editonhold"); // onhold flag
            item.onhold = ctl.is(':checked');
        }
        
        return item;
    }
    
    function CopyItemToEditRow(item, editrow) {
       if ((item!=null) && (editrow!=null)) { //not creating editrow on the fly. do via clone() elsewhere
            // looking for input boxes. special handling
            var ctl = null, txt = null;
            
            ctl = editrow.find(".edititem");   //description         
            ctl.val(item.description);
            
            ctl = editrow.find(".editunitprice"); // unit price
            ctl.val(item.unitprice.toFixed(2)); //already in floating pt
            
            ctl = editrow.find(".editquantity"); ///quantity
            ctl.val(item.quantity);
            
            ctl = editrow.find(".editonhold"); // onhold flag
            ctl.prop('checked', item.onhold);
        }
        return editrow;
    }
    
    function ClearEditRow(editrow) {
       if (editrow!=null) {
            // looking for input boxes. special handling
            var ctl = null, txt = null;
            
            ctl = editrow.find(".edititem");   //description         
            ctl.val(DEF_DESC);
            
            ctl = editrow.find(".editunitprice"); // unit price
            ctl.val(DEF_PRICE.toFixed(2)); //already in floating pt
            
            ctl = editrow.find(".editquantity"); ///quantity
            ctl.val(DEF_QTY);
            
            ctl = editrow.find(".editonhold"); // onhold flag
            ctl.prop('checked', false);
        }
        return editrow;
    }
    
    function SetHoldtoPageRow(onhold, pagerow) {
        if (pagerow!=null) {
            // add jquery style to toggle hold status
            // (onhold=true) grey out, strike through, remove subtotal
            // (onhold=false) grey out, strike through, remove subtotal
           (onhold) ? pagerow.addClass("onhold") : pagerow.removeClass("onhold");// Set hold flag on html
            SetRowButtonVisibility(pagerow, !onhold, !onhold, true); // set button visibility: HOLD button STAYS ON!
        }
    }
    
    /* Control of buttons to be on or off */
    function SetRowButtonVisibility(pagerow, btndelete, btnedit, btnhold) {
        if (pagerow!= null) {
            (btndelete) ? pagerow.find(".delete").show() : pagerow.find(".delete").hide();
            (btnedit) ? pagerow.find(".edit").show() : pagerow.find(".edit").hide();
            (btnhold) ? pagerow.find(".hold").show() : pagerow.find(".hold").hide();
        }
    }
       
    /* enable disable */
    function disableElements(el) {
        for (var i = 0; i < el.length; i++) {
            el[i].disabled = true;
            //el.css({"background-color": "#888888"});
            
            disableElements(el[i].children);
        }
    }
    function enableElements(el) {
        for (var i = 0; i < el.length; i++) {
            el[i].disabled = false;
            //el.css({"background-color": "#ffffff"});
            
            enableElements(el[i].children);
        }
    }
    
    /* string parsing*/
    function GetFloatFromCurrency(strval) {
        return parseFloat(strval.substring(1)); //assume 1st char is $
    }
    
    /***
    Cart Total Calculations
    ***/
    function getItemTotal(row) {
        var itemtotal = 0.00;
        if (row!=null) {
            itemtotal = row.unitprice * row.quantity;
        }
        return itemtotal;
    }
    
    /* includehold: If the row.onhold = true, do the following
     * includehold = true: use this item total
     * includehold = false: itemtotal = 0.00. HOLD NOT INCLUDED!
     * */ 
    function getSubTotal(cart, includehold) {
        var st = 0.00;
        if (hasItems(cart)) {
            for (i=0; i<cart.salesitems.length; i++) {
                var rowt = getItemTotal(cart.salesitems[i]);
                
                // If not including holds, and this is onhold, zero out
                var onhold = cart.salesitems[i].onhold;
                if (!includehold && onhold) rowt = 0.00;
 
                st = st + rowt;   
            }
        }
        return st;
    }
    
    /* includehold: See note on getSubTotal() */
    function getTax(cart, includehold) {
        return (getSubTotal(cart, includehold) * (cart.taxrate * 0.01));
    }
     
    function getPurchaseTotal(cart, includehold) {
        var subtotal = getSubTotal(cart, includehold);
        var tax = getTax(cart, includehold);
        return (subtotal + tax);
    }
    
    
    
    
    /***
    TEST FUNCTIONS
    ***/
    /* A random function strictly for testing. SHOULD NOT be called on a live site */
    /* EXAMPLE: TEST_DEBUG("editbox_addrow", ($(this).closest(".page-section").find(".edit"))); // we'll take the first element of the template and add a new version for testing */
    function TEST_DEBUG(type, args) {
        if (type == "init") {      
            initTestData();
            UpdateCartPage(_salescart);
        }
         else if (type == "select") {
            //var idx = $(".cart-list").children().index(this) + 1;
            var idx = GetSelectedRowNumber(args);            
            alert ("I just clicked the " + idx + " row" );
        }
        else if (type == "delete") {
            var idx = GetSelectedRowNumber(args); //1th element
            DeleteItemInCart(_salescart, idx-1);
            UpdateCartPage(_salescart);
            
            //alert ("I just clicked the " + idx + " row" );
        }
        else if (type == "count"){
            var htmllist = $(".cart-list").children();
            var count = htmllist.length;
            $(".cart-template").find(".update").text(htmllist.first().text() + "--->" + count);
        }
        
        else if (type == "holdtoggle") {
            var idx = GetSelectedRowNumber(args); //1th element
            ToggleHoldItemInCart(_salescart, idx-1);
            UpdateCartPage(_salescart);
        }
        else if (type == "editboxin") {
            var idx = GetSelectedRowNumber(args); //1th element
            var elemrow = GetPageRow(idx-1); // pass 0th-element
            _selectedRow = elemrow; ////// THIS IS TO KEEP TRACK OF THE SELECTED ROW !!!!!!
            SetEditStyle(true);
            var item = CopyPageRowToItem(elemrow, null);
            
            var editrow = GetEditRow($(".update"));
            CopyItemToEditRow(item, editrow);
        }
        else if (type == "editboxout_editrow") { // edit row
            var idx = GetSelectedRowNumber(_selectedRow); //1th element
            var elemrow = GetEditRow($(".update")); // pass 0th-element
            var item = CopyEditRowToItem(elemrow, null);
            
            EditItemInCart(_salescart, idx-1, item);
            UpdateCartPage(_salescart);
            SetEditStyle(false);
            _selectedRow = null; ////// THIS IS TO KEEP TRACK OF THE SELECTED ROW !!!!!!
        }
        else if (type == "editboxout_addrow") {
            //var idx = GetSelectedRowNumber(args); //1th element
            //var elemrow = GetPageRow(idx-1); // pass 0th-element
            var editrow = GetEditRow($(".update"));  //$(".cart-edit").find(".update"));
            var item = CopyEditRowToItem(editrow, null);
            
            AddItemToCart(_salescart, item);
            UpdateCartPage(_salescart);
            SetEditStyle(false);
            _selectedRow = null; ////// THIS IS TO KEEP TRACK OF THE SELECTED ROW !!!!!!
        }
        else if (type == "editboxout_cancel") {
            var editrow = GetEditRow($(".update"));  //$(".cart-edit").find(".update"));
            ClearEditRow(editrow);
            UpdateCartPage(_salescart);
            SetEditStyle(false);
            _selectedRow = null; ////// THIS IS TO KEEP TRACK OF THE SELECTED ROW !!!!!!
        }
    }
    
    /* TEST DATA: Data to start with. Normally would come from some other datasource */
    function initTestData() {
        var item1 = new SaleItem("Chicken Soup for the Soul: A study in the religious underpinnings of farm animals", 32.99, 2, false);
        var item2 = new SaleItem("Stick It!: Hip ways to use Wood", 14.99, 5, false);
        var item3 = new SaleItem("Javascript for Lemmings: Poster birds of O'Reilley Books", 22.45, 3, true); // test on hold
        var item4 = new SaleItem("Horse Whisperers: Barnyard Calendar Series", 5.99, 8, false);
        var items = new Array(4);
        items[0] = item1;
        items[1] = item2;
        items[2] = item3;
        items[3] = item4;
        
        _salescart = new SalesCart(items, DEF_STATE, DEF_RATE);
        var editrow = GetEditRow($(".update"));  //$(".cart-edit").find(".update"));
        ClearEditRow(editrow);
    }
       
});