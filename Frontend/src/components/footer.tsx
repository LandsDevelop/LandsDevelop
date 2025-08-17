// src/components/Footer.tsx
import React from "react";
import { Mail, Phone, MapPin } from "lucide-react";

const year = new Date().getFullYear();

export default function Footer() {
  return (
    <footer className="border-t bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          {/* Brand */}
          <div className="space-y-3">
            <h3 className="text-xl font-semibold tracking-tight">LandsDevelop</h3>
            <p className="text-sm text-gray-600">
              <span className="font-medium">A product/brand of InventorHeads</span>
            </p>
            <p className="text-xs leading-relaxed text-gray-500">
              © {year} <span className="font-medium">LandsDevelop</span>. All rights reserved.
              <br />
              © {year} <span className="font-medium">InventorHeads</span>. All rights reserved.
              <br />
              LandsDevelop™ is a brand owned and operated by InventorHeads (registered entity).
            </p>
          </div>

          {/* Legal / DLT */}
          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-700">
              Legal / DLT Disclosure
            </h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>
                <span className="font-medium">Legal Entity (as per DLT):</span>{" "}
                InventorHeads <span className="text-gray-500">(Registered Company)</span>
              </li>
              <li>
                <span className="font-medium">Public Brand:</span> LandsDevelop
              </li>
              <li>
                <span className="font-medium">DLT Header / Sender ID:</span>{" "}
                DTPSMS
              </li>
              <li>
                <span className="font-medium">Principal Entity (PE) ID:</span>{" "}
                <span className="text-gray-500">[add your PE ID here]</span>
              </li>
              <li>
                <span className="font-medium">Registered Office:</span>{" "}
                <span className="text-gray-500">[full legal address]</span>
              </li>
              <li>
                <span className="font-medium">CIN / GST (optional):</span>{" "}
                <span className="text-gray-500">[add if applicable]</span>
              </li>
            </ul>
          </div>

          {/* Links */}
          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-700">
              Company
            </h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li><a className="hover:text-black" href="/about">About</a></li>
              <li><a className="hover:text-black" href="/properties">Browse Properties</a></li>
              <li><a className="hover:text-black" href="/post-property">Post Property</a></li>
              <li><a className="hover:text-black" href="/contact">Contact</a></li>
              <li><a className="hover:text-black" href="/privacy">Privacy Policy</a></li>
              <li><a className="hover:text-black" href="/terms">Terms of Use</a></li>
              <li><a className="hover:text-black" href="/grievance">Grievance Redressal</a></li>
            </ul>
          </div>

          {/* Reach us */}
          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-700">
              Reach Us
            </h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <Mail className="mt-0.5 h-4 w-4" />
                <a href="mailto:support@landsdevelop.com">support@landsdevelop.com</a>
              </li>
              <li className="flex items-start gap-2">
                <Phone className="mt-0.5 h-4 w-4" />
                <a href="tel:+91XXXXXXXXXX">+91-XXXXXXXXXX</a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4" />
                <span>[Registered office address]</span>
              </li>
            </ul>
            <p className="mt-4 text-xs text-gray-500">
              All trademarks are property of their respective owners. By using this site you
              agree to our Terms & Privacy Policy.
            </p>
          </div>
        </div>

        {/* Disclaimer bar */}
        <div className="mt-8 rounded-lg bg-gray-50 p-4">
          <p className="text-xs leading-relaxed text-gray-600">
            <span className="font-semibold">Disclaimer:</span> LandsDevelop is a property
            listing/discovery platform. Information is provided by owners, developers, or
            agents and may be subject to change. InventorHeads and LandsDevelop do not
            broker transactions or guarantee listings; users should verify details
            independently before making decisions.
          </p>
        </div>
      </div>
    </footer>
  );
}
