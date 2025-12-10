import React, { useEffect } from 'react';

interface PayPalDonateProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function BuyMeCoffee({ className = '', size = 'md' }: PayPalDonateProps) {
  const sizeClasses = {
    sm: 'max-w-[120px]',
    md: 'max-w-[150px]',
    lg: 'max-w-[200px]'
  };

  useEffect(() => {
    // Check if PayPal script is already loaded
    if (typeof window !== 'undefined' && !(window as any).PayPal) {
      const script = document.createElement('script');
      script.src = 'https://www.paypalobjects.com/donate/sdk/donate-sdk.js';
      script.charset = 'UTF-8';
      script.async = true;
      
      script.onload = () => {
        if ((window as any).PayPal) {
          renderPayPalButton();
        }
      };
      
      document.head.appendChild(script);
      
      return () => {
        document.head.removeChild(script);
      };
    } else if ((window as any).PayPal) {
      renderPayPalButton();
    }
  }, []);

  const renderPayPalButton = () => {
    const buttonContainer = document.getElementById(`paypal-donate-${size}`);
    if (buttonContainer && (window as any).PayPal) {
      buttonContainer.innerHTML = ''; // Clear any existing content
      
      (window as any).PayPal.Donation.Button({
        env: 'production',
        hosted_button_id: 'SARBP7AWNJPL2',
        image: {
          src: 'https://pics.paypal.com/00/s/MTdkYTQ1NTQtYzY0NC00ZDAzLTk5NjAtODMyYWE3ZDMzMDEz/file.PNG',
          alt: 'Donate with PayPal button',
          title: 'PayPal - The safer, easier way to pay online!',
        }
      }).render(`#paypal-donate-${size}`);
    }
  };

  return (
    <div 
      className={`inline-block transition-transform hover:scale-105 ${sizeClasses[size]} ${className}`}
      title="Donate with PayPal"
    >
      <div id={`paypal-donate-${size}`}>
        {/* Fallback content while PayPal loads */}
        <div className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium cursor-pointer hover:bg-blue-600 transition-colors">
          💝 Donate with PayPal
        </div>
      </div>
    </div>
  );
}