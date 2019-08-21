App = {
  web3Provider: null,
  contracts: {},
  all_product : [],
  self_product:[],
  buy_transaction_list:[],
  sell_transaction_list:[],
  balance : null,
  init: function() {
    return App.initWeb3();
  },

  initWeb3: function() {
    // TODO: refactor conditional
    if (typeof web3 !== 'undefined') {
      // If a web3 instance is already provided by Meta Mask.
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      // Specify default instance if no web3 instance provided
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
      web3 = new Web3(App.web3Provider);
    }
    return App.initContract();
  },
  initContract: function() {
    $.getJSON("shop.json", function(shop) {
      // Instantiate a new truffle contract from the artifact
      App.contracts.shop = TruffleContract(shop);
      // Connect provider to interact with contract
      App.contracts.shop.setProvider(App.web3Provider);
      //App.show();
      //App.product_owned();
      return App.render();
    });
  },
  listenForEvent_buySuccess: function() {
    App.contracts.shop.deployed().then(function(instance) {
      instance.buy_product_success({},{
        fromBlock: 'latest',
        toBlock: 'latest'
      }).watch(function(error,event){
        console.log("event triggered", event)
        return App.initWeb3();
      });
    });
  },
  listenForEvent_modify: function() {
    App.contracts.shop.deployed().then(function(instance) {
      instance.modify_product_success({},{
        fromBlock: 'latest',
        toBlock: 'latest'
      }).watch(function(error,event){
        console.log("event triggered", event)
        return App.initWeb3();
      });
    });
  },
  listenForEvent_post: function() {
    App.contracts.shop.deployed().then(function(instance) {
      instance.post_product_success({},{
        fromBlock: 'latest',
        toBlock: 'latest'
      }).watch(function(error,event){
        console.log("event triggered", event)
        return App.initWeb3();
      });
    });
  },
  listenForEvent_withdraw: function() {
    App.contracts.shop.deployed().then(function(instance) {
      instance.withdraw_success({},{
        fromBlock: 'latest',
        toBlock: 'latest'
      }).watch(function(error,event){
        console.log("event triggered", event)
        return App.initWeb3();
      });
    });
  },
  listenForEvent_topup: function() {
    App.contracts.shop.deployed().then(function(instance) {
      instance.top_up_success({},{
        fromBlock: 'latest',
        toBlock: 'latest'
      }).watch(function(error,event){
        console.log("event triggered", event)
        return App.initWeb3();
      });
    });
  },

  render:function(){
    var shopInstance;
    var loader = $("#loader");
    var content = $("#content");
    loader.show();
    content.hide();
    web3.eth.getCoinbase(function(error, account) {
      if (error === null) {
        App.account = account;
        $("#accountAddress").html("Your Account No.: " + account);
      }
    });
    App.contracts.shop.deployed().then(function(instance){
      shopInstance = instance;
      return shopInstance.product_index();
    }).then(async function(product_index){
      var selfproductsList;
      selfproductsList = $("#selfproductsList");
      selfproductsList.empty();
      //console.log(selfproductsList);
      App.self_product=[];
      shopInstance.get_balance().then(function(Balance){
        balance = Balance['c'][0];
        $("#accountBalance1").html("Your Account Balance: " + balance + ' Chickens');
        $("#accountBalance2").html("Your Account Balance: " + balance + ' Chickens');
      });
      for (var i = 0; i < product_index; i++){
        var product = await shopInstance.get_product(i);
        var id = product[0];
        var name = web3.toAscii(product[1]);
        var discription = web3.toAscii(product[2]);
        var price = product[3];
        var quantity = product[4];
        var owner = product[5];
        var exist = product[6];
        if (exist){
          App.all_product.push([id,name,discription,price,quantity,owner]);
        }
        if(owner == App.account){
          App.self_product.push([id,name,discription,price,quantity,owner]);
          var selfproductTemplate = "<tr><th>" + id + "</th><td>" + name + "</td><td>" + discription + "</td><td>" + price + "</td><td>" + quantity + "</td><td>" + owner + "</td><td>" + exist + "</td></tr>"
        };
        selfproductsList.append(selfproductTemplate);
    }
    }).then(function(display){
      loader.hide();
      content.show();

    }).catch(function(error){
      console.warn(error);
    });
  },
  show_all:function(){
    App.contracts.shop.deployed().then(function(instance){
      shopInstance = instance;
      console.log(shopInstance.address);
      return shopInstance.product_index();
    }).then(function(product_index){
    var productsList = $("#productsList");
    productsList.empty();
    //console.log(productsList);
    App.all_product=[];
    App.contracts.shop.deployed().then(function(instance){
        for (var i = 0; i < product_index; i++){
        shopInstance.get_product(i).then(function(product){
        var id = product[0];
        var name = web3.toAscii(product[1]);
        var discription = web3.toAscii(product[2]);
        var price = product[3];
        var quantity = product[4];
        var owner = product[5];
        var exist = product[6];
        if (exist) {
          App.all_product.push([id,name,discription,price,quantity,owner]);
          var productTemplate = "<tr><th>" + id + "</th><td>" + name + "</td><td>" + discription + "</td><td>" + price + "</td><td>" + quantity + "</td><td>" + owner + "</td></tr>"
          productsList.append(productTemplate);
        }
        });
      }
    });
  }).then(function(display){
    $("#loader").hide();
      $("#content").show();
    //return productsList;
  }).catch(function(error){
    console.warn(error);
  });
},
top_up:function(pending){
  App.contracts.shop.deployed().then(function(instance){
    var pend = parseInt(pending);

    instance.top_up.call(pend,{value: web3.toWei(pend/1000,'ether')}).then(function(result){
      if (result == true){
        instance.top_up(pend,{value: web3.toWei(pend/1000,'ether')});
      }
      if (result !== true){
        alert("Top up failed");
      }
    });
  }).then(function(result) {
    $("#loader").hide();
    $("#content").show();
    App.listenForEvent_topup();
  }).catch(function(err) {
    console.error(err);
  });
},
  modify:function(){
    console.log("modify");
    var m_id = $('#mod_id').val();
    var m_name = $('#mod_name').val();
    var m_dis = $('#mod_discription').val();
    var m_price = $('#mod_price').val();
    var m_quantity = $('#mod_quantity').val();
    var exist = $('input[name="exist"]:checked').val();
    console.log(exist=="1")
    if (m_id == ""){
      alert("Cannot modify product without ID");
    }
    if (m_id !== ""){
    App.contracts.shop.deployed().then(function(instance){
      instance.get_product(m_id).then(function(product){
        var id = product[0];
        var name = web3.toAscii(product[1]);
        var discription = web3.toAscii(product[2]);
        var price = product[3]['c'][0];
        var quantity = product[4]['c'][0];;
        if(m_name != ""){
          name = m_name;
        };
        if(m_dis != ""){
          discription = m_dis;
        };
        if(m_price != ""){
          price= m_price;
        };
        if(m_quantity != ""){
          quantity = m_quantity;
        };
        //console.log(name,discription,price,quantity);
        instance.modify_byID(m_id,name,discription,price,quantity,exist=="1");
      });
    }).then(function(result) {
      //$("#loader").hide();
      //$("#content").show();
      App.listenForEvent_modify();
    }).catch(function(err) {
      console.error(err);
    });
  }
},
buy_history:function(){
  console.log(2);
  App.contracts.shop.deployed().then(function(instance){
    shopInstance = instance;
    //shopInstance.post_product("a","b",1,10);
    console.log(shopInstance.address);
    return shopInstance.transaction_index();
  }).then(function(transaction_index){
  var buytransactionsList = $("#buytransactionsList");
    buytransactionsList.empty();
  App.buy_transaction_list = [];
  App.contracts.shop.deployed().then(function(instance){
    for (var i = 0; i < transaction_index; i++){
      shopInstance.get_transaction(i).then(function(transactions){
      console.log(transactions);
      var id = transactions[0];
      var buyer = transactions[1];
      var product_id = transactions[2];
      var name = web3.toAscii(transactions[3]);
      var price = transactions[4];
      var quantity = transactions[5];
      var time = transactions[6];
      var status = transactions[7];
      if(status == 1){ status = 'Order Processing'}
        if(status == 2){ status = 'Order Succeed'}
        if(status == 3){ status = 'Order Canceled'}
      var newDate = new Date();
      newDate.setTime(time);
      time = newDate.toTimeString();

      if (App.account == buyer){
        App.buy_transaction_list.push([id,buyer,product_id,name,price*quantity,quantity,time,status]);
        var buytransactionTemplate = "<tr><th>" + id + "</th><td>" + buyer + "</td><td>" + product_id + "</td><td>" + name + "</td><td>" + price*quantity + "</td><td>" + quantity + "</td><td>" + time + "</td><td>" + status + "</td></tr>"
      }
      console.log(App.buy_transaction_list);
      buytransactionsList.append(buytransactionTemplate);
    });
  }
  });
}).then(function(display){
  $("#loader").hide();
  $("#content").show();
  return buytransactionsList;
}).catch(function(error){
  console.warn(error);
});
},
sell_history:function(){
  console.log(2);
  App.contracts.shop.deployed().then(function(instance){
    shopInstance = instance;
    console.log(shopInstance.address);
    return shopInstance.transaction_index();
  }).then(function(transaction_index){
  var selltransactionsList = $("#selltransactionsList");
    selltransactionsList.empty();
  App.sell_transaction_list = [];
  App.contracts.shop.deployed().then(function(instance){
    for (var i = 0; i < transaction_index; i++){
      shopInstance.get_transaction(i).then(function(transactions){
        var id = transactions[0];
        var buyer = transactions[1];
        var product_id = transactions[2];
        var name = web3.toAscii(transactions[3]);
        var price = transactions[4];
        var quantity = transactions[5];
        var time = transactions[6];
        var status = transactions[7];
        if(status == 1){ status = 'Order Processing'}
        if(status == 2){ status = 'Order Succeed'}
        if(status == 3){ status = 'Order Canceled'}
        var newDate = new Date();
        newDate.setTime(time);
        time = newDate.toTimeString();
      if (App.account != buyer){
        App.sell_transaction_list.push([id,buyer,product_id,name,price*quantity,quantity,time,status]);
        var selltransactionTemplate = "<tr><th>" + id + "</th><td>" + buyer + "</td><td>" + product_id + "</td><td>" + name + "</td><td>" + price*quantity + "</td><td>" + quantity + "</td><td>" + time + "</td><td>" + status + "</td></tr>"
      }
      selltransactionsList.append(selltransactionTemplate);
    });
  }
  });
}).then(function(display){
  $("#loader").hide();
  $("#content").show();
  return selltransactionsList;
}).catch(function(error){
  console.warn(error);
});
},
refund:function(id){
  App.contracts.shop.deployed().then(function(instance){
    instance.cancel_transac.call(parseInt(id)).then(function(result){
      if(result == 0){
        alert("Transaction does not exist!");
      }
      if(result == 1){
        alert("Transaction selected cannot be changed");
      }
      if(result == 2){
        instance.cancel_transac(parseInt(id),{gas:3000000});
      }
    })
  });
},
comfirm:function(id){
  App.contracts.shop.deployed().then(function(instance){
    instance.comfirm_transac.call(parseInt(id)).then(function(result){
      if(result == 0){
        alert("Transaction does not exist!");
      }
      if(result == 1){
        alert("Transaction selected cannot be changed");
      }
      if(result == 2){
        console.log(1);
        instance.comfirm_transac(parseInt(id),{gas:3000000});
      }
    })
  });
},
withdraw:function(amount){
  App.contracts.shop.deployed().then(function(instance){
    instance.withdraw.call(parseInt(amount)).then(function(result){
      if(result == 0){
        alert("Try to withdraw a invalid amount");
      }
      if(result == 1){
        instance.withdraw(parseInt(amount),{gas:3000000});
      }
    })
  }).then(function(result) {
    $("#loader").hide();
    $("#content").show();
    App.listenForEvent_withdraw();
  }).catch(function(err) {
    console.error(err);
  });
},
  post:function(){
    var name = $('#new_name').val();
    var discription = $('#new_discription').val();
    var price = $('#new_price').val();
    var quantity = $('#new_quantity').val();

    App.contracts.shop.deployed().then(function(instance){
      console.log(name,discription,price,quantity,App.account);
      instance.post_product(name,discription,price,quantity,{from:App.account,gas:3000000});
    }).then(function(result) {
      $("#loader").hide();
      $("#content").show();
      App.listenForEvent_post();
    }).catch(function(err) {
      console.error(err);
    });
  },
  buy:function(productId,amount){
    // var productId = $('#buy_id').val();
    // var amount = $('#buy_quantity').val();
    var totalprice;
    console.log(productId);
    App.contracts.shop.deployed().then(function(instance){
      console.log(productId);
        instance.get_product(productId).then(function(product){
        var price = App.all_product[productId][3];
        var owner = App.all_product[productId][5];
        totalprice = price * amount;
        console.log(productId,amount,totalprice,owner,App.account);
        // console
        instance.buy_product.call(productId,amount).then(function(flag){
          console.log(flag);
          if(flag == 1){
            alert("Amount required exceeds storage!")
          }
          if (flag == 0){
            alert("Product does not exist!")
          }
          if( flag == 2){
            alert("You can not buy product you owned!")
          }
          if( flag == 3){
            alert("Insufficient Balance, please top up!")
          }
          if(flag == 4){
            instance.buy_product(productId,amount);
          }
        })
        // instance.buy_product(productId,amount,{from: App.account, to:owner, value:web3.toWei(totalprice,'finney'),gas:3000000});
        //Need to be optimised.
        //return new Promise( function(resolve , reject){
          //web3.eth.sendTransaction({from :App.account, to:owner, value:web3.toWei(totalprice,'ether'),gas:3000000}  , function(err , success ){
            //  if (err)
              //    return reject(err);
              //else
                //  return resolve(success);
          //});
      //});
      });
    }).then(function(result) {
      $("#loader").hide();
      $("#content").show();
      App.listenForEvent_buySuccess();

    }).catch(function(err) {
      console.error(err);
    });
  }
};
  $(function() {
    $(window).load(function() {
      App.init();
    });
});