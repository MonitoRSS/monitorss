import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import config from './config/config';
import { validateConfig } from './config/config.validate';
import { DiscordAuthModule } from './services/discord-auth/discord-auth.module';
import { DiscordUserModule } from './services/discord-user/discord-user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      ignoreEnvFile: true,
      load: [config],
      validate: validateConfig,
    }),
    DiscordAuthModule,
    DiscordUserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}