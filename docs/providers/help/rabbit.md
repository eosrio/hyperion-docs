# RabbitMQ

## How to Delete all the queues from RabbitMQ?

!!! warning
    Be sure you really want to do this!
    This gonna reset all your rabbitMQ configuration, and return it to the default state.

### 1. Using Policies - Management Console

  - Go to [Management Console](http://localhost:15672){:target="_blank"} at http://localhost:15672
  - Click on Admin tab
  - Policies tab (on the right side)
  - Add Policy
  - Fill Fields
    - Virtual Host: Select (Default is `/hyperion`)
    - Name: Expire All Policies(Delete Later)
    - Pattern: .*
    - Apply to: Queues
    - Definition: expires with value 1 (change type from String to Number)
  - Click on `Add / update policy`
  - Checkout Queues tab again, all queues must be deleted.
  
  [![rabbit](../../assets/img/rabbit.png)](../../assets/img/rabbit.png)
 
!!! warning
    You must remove this policy after this operation.
    
### 2. Using command line 

First, list your queues:
````bash
rabbitmqadmin list queues name 
````
Then from the list, you'll need to manually delete them one by one:
````bash
rabbitmqadmin delete queue name='queuename' 
````
Because of the output format, doesn't appear you can grep the response from `list queues`. 

Alternatively, if you're just looking for a way to clear everything, use:
````bash 
rabbitmqctl stop_app
rabbitmqctl reset
rabbitmqctl start_app
````

<br>

