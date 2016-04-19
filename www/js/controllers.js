angular.module('restaurantApp.controllers', ['restaurantApp.services', 'restaurantApp.directives'])

.controller('AppCtrl', function() {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});
})
.controller('logInCtrl', LogInCtrl)
.controller('ordersCtrl', OrdersCtrl);

///////////////////////////////////// Log In Controller ////////////////////////////
function LogInCtrl (logInService, $ionicLoading, $window, $state) {
  this.logInService = logInService;
  this.$ionicLoading = $ionicLoading;
  this.$window = $window;
  this.$state = $state;

  if (this.$window.localStorage['setHeaders']) {
    this.$state.go('app.orders')
  }

  this.logInInfo = {
    email : "matt@menu.me",
    password: "handsoff9"
  }
}


/**
 * Takes user credentials and calls the logMeIn function rom the logInService
 * @returns{Promise<Object>}
 */
LogInCtrl.prototype.logMeIn = function () {
  var self = this;

  //Show the Ionic Loading screen
  this.$ionicLoading.show();

  this.logInService.logMeIn(this.logInInfo).then(function(result) {
    self.$ionicLoading.hide();
    self.$state.go('app.orders')
  })
};

/////////////////////////////////// Orders Controller//////////////////////////////
function OrdersCtrl (ordersService, placeService, $ionicModal, $scope, $interval) {
  this.ordersService = ordersService;
  this.placeService = placeService;
  this.$ionicModal = $ionicModal;
  this.$scope = $scope;
  this.$interval = $interval;

  this.orderOptionsEnabled = false;

  this.selectedOrder = this.selectInitialOrder();

  this.intervalInstance;

  this.startCheckingForOrders();

  //For cleaning up the help modal from the DOM
  $scope.$on('$destroy', function() {
    $scope.modal.remove();
  });

}

/**
 * Shows the order details for the selected order
 * @param{Object} order
 */
OrdersCtrl.prototype.selectOrder = function (order) {

  this.orderOptionsEnabled = false;
  this.selectedOrder = order;
};

/**
 * Calls the confirm order function on ordersService
 */
OrdersCtrl.prototype.confirmOrder = function () {
  this.ordersService.confirmOrder(this.selectedOrder);
};

/**
 * If there are any active orders it will return one or return false
 * @returns{Object|Boolean} An order object or false
 */ 
OrdersCtrl.prototype.selectInitialOrder = function () {
  return this.ordersService.orders.unconfirmed[0] || this.ordersService.orders.confirmed[0] || this.ordersService.orders.ready[0] || false;
};


/**
 * Not working properly. Needs to remove the modal when user closes it
 */
OrdersCtrl.prototype.requestHelp = function () {
  var self = this;
  this.placeService.requestHelp();
  this.$ionicModal.fromTemplateUrl('/templates/requestHelpModal.html', {
    scope: this.$scope
  }).then(function(modal){
    console.log(modal, 'modal');
    self.modal = modal;
    self.modal.show();
  });
};

OrdersCtrl.prototype.closeModal = function () {
  this.modal.remove();
};

/**
 * every 30s
 */
OrdersCtrl.prototype.getOrders = function () {
  var self = this;
  console.log('getOrders called');
  this.ordersService.getOrders().then(function(result){
    self.selectedOrder = self.selectInitialOrder();
  })
};

/**
 * Starts interval that calls getOrders()
 */
OrdersCtrl.prototype.startCheckingForOrders = function () {
  var self = this;

  if (angular.isDefined(this.intervalInstance)) {
    return;
  }

  this.intervalInstance = this.$interval(function(){
    self.getOrders();
  }, 30000);
};

/**
 * Takes an order and returns the total number of items in order
 * @param{Object} order
 * @returns{Number}
 */
OrdersCtrl.prototype.findTotalItems = function (order) {
  if (!order) {return;}
  var count = 0;
  for (var i = 0; i < order.items.length; i++) {
    count += order.items[i].quant;
  }
  return count;
};

/**
 * Toggles whether to show the additonal order options or not
 */
OrdersCtrl.prototype.toggleOrderOptions = function () {
  this.orderOptionsEnabled = !this.orderOptionsEnabled;
};
