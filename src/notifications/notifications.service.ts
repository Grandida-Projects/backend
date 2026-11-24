import { Inject, Injectable, Logger } from '@nestjs/common';

export interface EmailMessage {
  to: string;
  subject: string;
  text: string;
}
export interface EmailProvider {
  send(message: EmailMessage): Promise<void>;
}

@Injectable()
export class LogEmailProvider implements EmailProvider {
  private readonly logger = new Logger(LogEmailProvider.name);
  send(message: EmailMessage): Promise<void> {
    this.logger.log(
      `Email to ${message.to}: ${message.subject}\n${message.text}`,
    );
    return Promise.resolve();
  }
}

@Injectable()
export class NotificationService {
  constructor(
    @Inject(LogEmailProvider) private readonly provider: EmailProvider,
  ) {}

  /** #599 — sends the one-time token that proves the recipient controls `to`. */
  sendEmailVerification(to: string, token: string): Promise<void> {
    return this.provider.send({
      to,
      subject: 'Verify your email address',
      text: `Use this token to verify your email address (valid for 24 hours):\n\n${token}\n`,
    });
  }

  /**
   * #503 — an expired listing is still live on chain, where only the seller
   * can delist it, so they are asked to sign `cancel_resale`.
   */
  sendResaleListingExpired(input: {
    to: string;
    sellerName: string;
    eventName: string;
    ticketId: string;
  }): Promise<void> {
    return this.provider.send({
      to: input.to,
      subject: `Your ${input.eventName} resale listing has expired`,
      text: `Hi ${input.sellerName},\n\nYour resale listing for ${input.eventName} has passed its expiry time, but the ticket is still listed on chain and can still be bought. To take it off the market, cancel the listing from your wallet (cancel-resale for ticket ${input.ticketId}).\n`,
    });
  }

  sendTicketReceipt(input: {
    to: string;
    buyerName: string;
    eventName: string;
    ticketType: string;
    seat: string;
  }): Promise<void> {
    return this.provider.send({
      to: input.to,
      subject: `Your ${input.eventName} ticket`,
      text: `Hi ${input.buyerName},\n\nYour ${input.ticketType} ticket for ${input.eventName} is confirmed.\nSeat: ${input.seat}\n`,
    });
  }
}
