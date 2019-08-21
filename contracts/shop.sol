pragma solidity ^0.4.18;


contract shop{
    uint256 public transaction_index=0;
    uint256 public product_index = 0;
    uint256 public balance = 0;
    uint256[] product_idArray;
    uint256[] transaction_idArray;
    //address[] shops_hash_array;

    mapping(uint256 => Product) products;
    mapping(uint256 => Transaction) transactions;
    mapping (address => User) shops;
    

    struct Product{
        uint256 id;
        bytes32 name;
        bytes32 description;
        uint256 price;
        uint256 quantity; 
        address owner;
        bool exist;
    }
    struct Transaction{
        uint256 id;
        address buyer;
        uint256 product_id;
        bytes32 name;
        uint256 price;
        uint256 quantity;
        // status:
        // 1: order proccessing
        // 2: order finished
        // 3: order canceled
        uint8 status;
        uint time;
    }
    struct User{
        bool exist;
        uint256 balance;
        address seller;
        uint256[] ownproducts;
        uint256[] transactionlist;
    }

    event post_product_success();
    event top_up_success();
    event withdraw_success();
    event buy_product_success();
    event modify_product_success();

    
    function post_product(bytes32 _name, bytes32 _description, uint256 _price, uint256 _quantity) public returns (bool){
        Product memory p = Product(product_index, _name, _description, _price, _quantity, msg.sender, true);
        if(_price > 0 && _quantity > 0 ){
            products[product_index] = p;   
            product_idArray.push(product_index);  
            shops[msg.sender].ownproducts.push(product_index);
            shops[msg.sender].seller = msg.sender;
            emit post_product_success();
            product_index = product_index + 1; 
            return true;
        }
        return false;
    }
    
    function get_product(uint256 _id) public view returns (uint256, bytes32, bytes32, uint256, uint256, address, bool){
        require(products[_id].name!=0 && _id < product_index);
        Product memory p = products[_id];
        return (p.id, p.name, p.description, p.price, p.quantity,p.owner,p.exist);
    }
    
    function get_all_products() public view returns (uint256[], bytes32[], bytes32[], uint256[], uint256[]){
        uint256 item_number = product_idArray.length;
        uint256[] memory id_array = new uint256[](item_number);
        bytes32[] memory name_array = new bytes32[](item_number);
        bytes32[] memory des_array = new bytes32[](item_number);
        uint256[] memory price_array = new uint256[](item_number);
        uint256[] memory quan_array = new uint256[](item_number);
        for (uint i;i<item_number;i++){
            uint256 id = product_idArray[i];
            Product memory p = products[id];
            id_array[i]= p.id;
            name_array[i]=p.name;
            des_array[i]=p.description;
            price_array[i]=p.price;
            quan_array[i]=p.quantity;
        }
        return (id_array,
            name_array,
            des_array,
            price_array,
            quan_array);
    }

    function get_products() public view returns (uint256[]) {
        return product_idArray;
    }
    
    function buy_product(uint256 _id, uint256 _amount) public returns (uint) {
        // we check whether the product exists
        // require(products[_id].name!=0 && _id < product_index);
        if (products[_id].name==0 || _id >= product_index) return 0;
        
        Product storage p = products[_id];
        
        // we check buying amount larger than 0 and whether the any product left or quantity is enough to sold
        if (_amount<=0 || p.quantity < _amount) return 1;
        
        // we don't allow the seller to buy his/her own product
        // require(p.owner != msg.sender);
        if (p.owner==msg.sender) return 2;
        
        if (shops[msg.sender].balance<_amount* p.price) return 3;

        // keep buyer's information
        
        p.quantity -= _amount;
        
        shops[msg.sender].balance -= _amount* p.price;

        Transaction memory t = Transaction(transaction_index, msg.sender, _id, p.name, p.price,  _amount, 1, now);
        
        transactions[transaction_index] = t;
        
        transaction_idArray.push(transaction_index);

        shops[msg.sender].transactionlist.push(transaction_index);
        
        shops[p.owner].transactionlist.push(transaction_index);
        
        transaction_index+=1;
        

        // trigger the event
        emit buy_product_success();
        return 4;
        
    }
    function get_transaction(uint256 _id) public view returns(uint256, address, uint256, bytes32,uint256, uint256, uint, uint8){
        require(_id < transaction_index);
        Transaction memory t = transactions[_id];
        return(_id, t.buyer, t.product_id, t.name, t.price, t.quantity, t.time, t.status);
    }
    
    function get_balance() public view returns(uint256) {
        return shops[msg.sender].balance;
    }

    function top_up(uint256 value) payable public returns (bool) {
        require(value == msg.value/10**15);
        shops[msg.sender].balance += value;
        emit top_up_success();
        return true;
    } 

    function comfirm_transac(uint id) public returns (uint)  {
        // transaction not exist
        if (transactions[id].name==0) return 0;
        Transaction storage t = transactions[id];
        // invid order status
        if (t.status==2 || t.status==3) return 1;
        t.status = 2;
        shops[products[t.product_id].owner].balance += t.price*t.quantity;
        return 2;
    }

    function cancel_transac(uint id) public returns (uint)  {
        // transaction not exist
        if (transactions[id].name==0) return 0;
        Transaction storage t = transactions[id];
        // invilid order status
        if (t.status==2 || t.status==3) return 1;
        shops[t.buyer].balance += t.price*t.quantity;
        products[t.product_id].quantity+=t.quantity;
        t.status = 3;
        return 2;
    }

    function withdraw(uint256 value) public returns (uint) {
        // invalid value
        if (shops[msg.sender].balance==0 || value <= 0 || shops[msg.sender].balance<value) return 0;
        shops[msg.sender].balance -= value;
        msg.sender.transfer(value*10**15);
        emit withdraw_success();
        return 1;
    }

    // function withdraw(uint16 value)  public returns (bool) {
    //     require(balance >= value);
    //     balance -= value;
    //     msg.sender.transfer(value);
    //     return true;
    // }
    //modifier the paramater.
    //clarafy the paramater is null or not in the web3
    function modify_byID(uint256 _id, bytes32 _name, bytes32 _description, uint256 _price, uint _quantity, bool exist)  public returns (uint) {
        if (msg.sender != products[_id].owner){
            return 0;
        }
        if (products[_id].name!=0 && _id < product_index && _price!=0){
            products[_id].name=_name;
            products[_id].description=_description;
            products[_id].price=_price;
            products[_id].quantity=_quantity;
            products[_id].exist= exist;
            emit modify_product_success();
            return 1;
        }
        return 2;
    }
    
}