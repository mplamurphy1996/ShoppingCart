$(document).ready(function() {
    /*** User Events ***/
    /* Edit Item */
    $(".edit").on("click", function() {
        alert("Edit the row item. Replace report row with editbox row.");
    });

    /* Delete Item */
    $(".delete").on("click", function() {
        //alert("Delete the row item");
        //$(this).parent().parent().remove(); // AW, come on! you can do better!!!!!!!!!!!!!!!!!!
        TEST_DEBUG("delete", this);
    });
    
    /* Hold Item */
    $(".hold").on("click", function() {
        //alert("Put Item on Hold. Strikethrough item and gray out controls.");
        TEST_DEBUG("add", this);
    });
    
    /* Update Item */
    $(".update").on("click", function() {
        alert("Accept the Edit. Replace the editbox row with the report row.");
        
    });

    /* Cancel Item */
    $(".cancel").on("click", function() {
        alert("Cancel the Edit. Replace the editbox row with the report row.");
    });
    
    /* Proceed to Checkout */
    $(".proceed").on("click", function() {
        //alert("Proceed to Checkout. For now, just inform the user that we will move on...\n \n USING THIS TO TEST DATA");
        TEST_DEBUG("init");
    });
    
    /* Get row selected */
    $(".viewed").on("click", function() {
            //?????? need this?
    });
 
 
    /*** shopping cart data definition ***/ 
    function SaleItem(desc, price, quan, hold) {
        this.description = desc;
        this.unitprice = price;
        this.quantity = quan;
        this.onhold = hold;
    };
    
    function SalesCart(items, state, rate) {
        this.salesitems = items;
        this.taxstate = state;
        this.taxrate = rate;
    };
    
    _salescart = new SalesCart(null, null, null); /* THE CART !!!*/
    
    /* shopping cart data control functions */
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
    
    /* Delete the SaleItem from teh cart. pass in 0-th element */
    function DeleteItemInCart(cart, i) {
        var initem = GetItemInCart(cart, i);
        if (initem!=null) {
            cart.salesitems.splice(i, 1); // reomve 1 item @ ith pos
        }
    }
    
    /*** shopping cart html control functions ***/
    /* refresh cart table with sales cart data */
    function UpdateCartPage(cart) {
        ClearItemList(true); // remove all rows
        AddItemListToPageList(cart.salesitems); // add all rows from data
        UpdateTotalsToPage(cart); // updated totals
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
                rownum = ($(".cart-list").children().index(row) + 1);
            }
        }
        return rownum;
    }
    
    /* pass in 0-th element */
    function GetPageRow(index) {
        if ((index>= 0) && (index < GetPageRowCount())) {
            var ctlstr = "div.cart-list div.viewed:eq(" + index + ")";
            return $(ctlstr);
        }
        else return null;
    }
    function GetPageRowCount() {
        return $(".cart-list").children().length;
    }
    
    function UpdateTotalsToPage(cart) { 
        $(".cart-total").find(".total-taxstate").text(cart.taxstate + " @ " + cart.taxrate.toFixed(2) + "%");       
        $(".cart-total").find(".total-subtotals").text("$" + getSubTotal(cart).toFixed(2));       
        $(".cart-total").find(".total-tax").text("$" + getTax(cart).toFixed(2));
        $(".cart-total").find(".total-purchase").text("$" + getPurchaseTotal(cart).toFixed(2));
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
            item.onhold = false; ///NEED TO FIGURE WHAT HTML/CSS ELEMENT HOLDS THIS!
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
    
    function SetHoldtoPageRow(onhold, pagerow) {
        // add jquery style to toggle hold status
        if (onhold) {
            //grey out, strike through, remove subtotal
            //disableElements(pagerow);
        } else {
            // standard row display
            //enableElements(pagerow);
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
    
    /* string parsing */
    function GetFloatFromCurrency(strval) {
        return parseFloat(strval.substring(1)); //assume 1st char is $
    }
    /*** Cart Total Calculations ***/
    function getItemTotal(row) {
        var itemtotal = 0.00;
        if (row!=null) {
            var price = row.unitprice;
            var qty = row.quantity;
            itemtotal = price * qty;
        }
        return itemtotal;
    }
    
    function getSubTotal(cart) {
        var st = 0.00;
        if (hasItems(cart)) {
            for (i=0; i<cart.salesitems.length; i++) {
                st = st + getItemTotal(cart.salesitems[i]);   
            }
        }
        return st;
    }
    
    function getTax(cart) {
        return (getSubTotal(cart) * (cart.taxrate * 0.01));
    }
     
    function getPurchaseTotal(cart) {
        var subtotal = getSubTotal(cart);
        var tax = getTax(cart);
        return (subtotal + tax);
    }
    
    
    
    
       /*** TEST FUNCTIONS ***/
    /* A random function strictly for testing. SHOULD NOT be called on a live site */
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
        else if (type == "add") {
            var idx = GetSelectedRowNumber(args); //1th element
            var elemrow = GetPageRow(idx-1); // pass 0th-element
            var item = CopyPageRowToItem(elemrow, null);
            AddItemToCart(_salescart, item);
            UpdateCartPage(_salescart);
            
            //alert ("I just clicked the " + idx + " row" );
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
        
        _salescart = new SalesCart(items, "TX", 6.25);
    }
       
});