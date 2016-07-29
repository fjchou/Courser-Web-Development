$(function () { // Same as document.addEventListener("DOMContentLoaded"...

  // Same as document.querySelector("#navbarToggle").addEventListener("blur",...
  $("#navbarToggle").blur(function (event) {
    var screenWidth = window.innerWidth;
    if (screenWidth < 768) {
      $("#collapsable-nav").collapse('hide');
    }
  });

  // In Firefox and Safari, the click event doesn't retain the focus
  // on the clicked button. Therefore, the blur event will not fire on
  // user clicking somewhere else in the page and the blur event handler
  // which is set up above will not be called.
  // Refer to issue #28 in the repo.
  // Solution: force focus on the element that the click event fired on
  $("#navbarToggle").click(function (event) {
    $(event.target).focus();
  });
});

(function (global) {

var dc = {};

var homeHtml = "snippets/home-snippet.html";
var allCategoriesUrl =
  "https://davids-restaurant.herokuapp.com/categories.json";
var categoriesTitleHtml = "snippets/categories-title-snippet.html";
var categoryHtml = "snippets/category-snippet.html";
var menuItemUrl = "https://davids-restaurant.herokuapp.com/menu_items.json?category=";
var menuItemsTitleHtml = "snippets/menu-items-title.html";
var menuItemHtml = "snippets/menu-items.html";

// Convenience function for inserting innerHTML for 'select'
var insertHtml = function (selector, html) {
  var targetElem = document.querySelector(selector);
  targetElem.innerHTML = html;
};

// Show loading icon inside element identified by 'selector'.
var showLoading = function (selector) {
  var html = "<div class='text-center'>";
  html += "<img src='images/ajax-loader.gif'></div>";
  insertHtml(selector, html);
};

// Return substitute of '{{propName}}'
// with propValue in given 'string'
var insertProperty = function (string, propName, propValue) {
  var propToReplace = "{{" + propName + "}}";
  string = string
    .replace(new RegExp(propToReplace, "g"), propValue);
  return string;
}

// Remove the class 'active' from home and switch to Menu button
var switchMenuToActive = function () {
  // Remove 'active' from home button
  var classes = document.querySelector("#navHomeButton").className;
  classes = classes.replace(new RegExp("active", "g"), "");
  document.querySelector("#navHomeButton").className = classes;

  // Add 'active' to menu button if not already there
  classes = document.querySelector("#navMenuButton").className;
  if (classes.indexOf("active") == -1) {
    classes += " active";
    document.querySelector("#navMenuButton").className = classes;
  }
};

// On page load (before images or CSS)
document.addEventListener("DOMContentLoaded", function (event) {

  // On first load, show home view
  showLoading("#main-content");
  $ajaxUtils.sendGetRequest(
    homeHtml,
    function (responseText) {
      document.querySelector("#main-content")
        .innerHTML = responseText;
    },
  false);
});

// Load the menu categories view
dc.loadMenuCategories = function () {
  showLoading("#main-content");
  $ajaxUtils.sendGetRequest(
    allCategoriesUrl,
    buildAndShowCategoriesHTML);
};

//Load the menu item view
//'categoryShort' is a short_name for a category
dc.loadMenuItems = function (categoryShort) {
  showLoading("#main-content");
  $ajaxUtils.sendGetRequest(menuItemUrl + categoryShort, buildAndShowMenuItemsHTML);
};

// Builds HTML for the categories page based on the data
// from the server
function buildAndShowCategoriesHTML (categories) {
  // Load title snippet of categories page
  $ajaxUtils.sendGetRequest(
    categoriesTitleHtml,
    function (categoriesTitleHtml) {
      // Retrieve single category snippet
      $ajaxUtils.sendGetRequest(
        categoryHtml,
        function (categoryHtml) {
          switchMenuToActive();
          var categoriesViewHtml =
            buildCategoriesViewHtml(categories,
                                    categoriesTitleHtml,
                                    categoryHtml);
          insertHtml("#main-content", categoriesViewHtml);
        },
        false);
    },
    false);
}


// Using categories data and snippets html
// build categories view HTML to be inserted into page
function buildCategoriesViewHtml(categories,
                                 categoriesTitleHtml,
                                 categoryHtml) {

  var finalHtml = categoriesTitleHtml;
  finalHtml += "<section class='row'>";

  // Loop over categories
  for (var i = 0; i < categories.length; i++) {
    // Insert category values
    var html = categoryHtml;
    var name = "" + categories[i].name;
    var short_name = categories[i].short_name;
    html =
      insertProperty(html, "name", name);
    html =
      insertProperty(html,
                     "short_name",
                     short_name);
    finalHtml += html;
  }

  finalHtml += "</section>";
  return finalHtml;
}

function buildAndShowMenuItemsHTML(menuItems) {
  
  $ajaxUtils.sendGetRequest(
    menuItemsTitleHtml,
    
    function(menuItemsTitleHtml){
      $ajaxUtils.sendGetRequest(menuItemHtml,
      
        function(menuItemHtml){
          switchMenuToActive();
          var finalHtml = buildMenuViewHtml(menuItems,menuItemsTitleHtml, menuItemHtml);
        
          insertHtml("#main-content", finalHtml);
      
      },false);
    },false);
}

function buildMenuViewHtml(menuItems,menuItemsTitleHtml, menuItemHtml) {
  var categoryName = menuItems.category.name;
  var categorySpecIns = menuItems.category.special_instructions;
  var categoryShortName = menuItems.category.short_name;
  var thisMenuTitle = menuItemsTitleHtml;
  var menuItemsIn = menuItems.menu_items;
  
  thisMenuTitle = insertProperty(thisMenuTitle, "name", categoryName);
  
  thisMenuTitle = insertProperty(thisMenuTitle, "special_instructions", categorySpecIns);
  
  var finalHtml = thisMenuTitle;

  for(var i = 0; i < menuItemsIn.length; i++){
    var thisMenuItem = menuItemHtml;
    thisMenuItem = insertProperty(thisMenuItem, "category", categoryShortName);
    for(var j in menuItemsIn[i]){
      if (j != 'id' && menuItemsIn[i][j] != null) {
        if ( j == "price_small" || j == "price_large"){
          
          thisMenuItem = insertProperty(thisMenuItem, String(j) , "$" + menuItemsIn[i][j].toFixed(2));
        
        }else if(j == "small_portion_name" || j == "large_portion_name") {
        
          thisMenuItem = insertProperty(thisMenuItem, String(j) , "(" + menuItemsIn[i][j] + ") ");
        
        }else{
        
          thisMenuItem = insertProperty(thisMenuItem, String(j) , menuItemsIn[i][j]);
        
        }
        
      }
      else if (menuItemsIn[i][j] == null){
      
        thisMenuItem = insertProperty(thisMenuItem, String(j) ,"");
      
      } 
    }
    if ( i % 2 !==0 ){
      
      thisMenuItem += '<div class="clearfix visible-md-block visible-lg-block"></div>';
    
    }
    
    finalHtml += thisMenuItem;
  }
  return finalHtml;
}


global.$dc = dc;

})(window);
