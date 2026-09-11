package com.cet.cet_backend.services;

import com.cet.cet_backend.config.RabbitMQConfig;
import org.springframework.amqp.rabbit.annotation.Queue;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

@Service
public class NotificationService {

//    @RabbitListener(queuesToDeclare =@Queue(
//    RabbitMQConfig.EXPENSE_QUEUE))
//    public void processExpenseNotification(String message){
//
//        System.out.println(Thread.currentThread().getName()+" [RabbitMQ Listener] Received message: "+message);
//
//        try{
//            System.out.println("[RabbitMQ Listener] Sending expense notification...");
//            Thread.sleep(5000);
//        }
//        catch(InterruptedException e){
//            Thread.currentThread().interrupt();
//        }
//        System.out.println("[RabbitMQ Listener] Sent successful!");
//
//    }

//    @RabbitListener(queues = RabbitMQConfig.EXPENSE_QUEUE)
    public void processExpenseNotification(String message) {
        System.out.println("[Radnik] Preuzeo zadatak: " + message);

        if (message.contains("amount: 999")) {
            System.out.println("[Radnik] Greška pri slanju! Baza ne odgovara.");
        }

        try {
            Thread.sleep(5000);
            System.out.println("[Radnik] Email uspešno poslat menadžeru!");
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }

}
