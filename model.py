import torch
import torch.nn as nn

class VanguardUNet(nn.Module):
    def __init__(self, in_channels=1, out_channels=1):
        super(VanguardUNet, self).__init__()
        self.enc1 = nn.Sequential(nn.Conv2d(in_channels, 32, 3, padding=1), nn.ReLU())
        self.enc2 = nn.Sequential(nn.Conv2d(32, 64, 3, padding=1), nn.ReLU(), nn.MaxPool2d(2))
        self.bottleneck = nn.Sequential(nn.Conv2d(64, 128, 3, padding=1), nn.ReLU())
        
        self.up2 = nn.ConvTranspose2d(128, 64, 2, stride=2)
        self.dec2 = nn.Sequential(nn.Conv2d(96, 64, 3, padding=1), nn.ReLU())
        self.out = nn.Conv2d(64, out_channels, 1)

    def forward(self, x):
        e1 = self.enc1(x)
        e2 = self.enc2(e1)
        b = self.bottleneck(e2)
        d2 = self.up2(b)
        d2 = torch.cat([d2, e1], dim=1)
        d2 = self.dec2(d2)
        return self.out(d2)

