/**
 * Custom DNS resolver that uses Google DNS (8.8.8.8) for SRV and TXT records.
 * This is needed because the local network DNS cannot resolve MongoDB Atlas SRV records.
 *
 * Usage: import './dns-override.js' BEFORE any mongoose/mongodb imports.
 */
import { Resolver } from 'dns';
import dns from 'dns';

const resolver = new Resolver();
resolver.setServers(['8.8.8.8']);

// Patch dns.promises.resolveSrv
const origResolveSrv = dns.promises.resolveSrv;
dns.promises.resolveSrv = (name) => {
  return new Promise((resolve, reject) => {
    resolver.resolveSrv(name, (err, addresses) => {
      if (err) reject(err);
      else resolve(addresses);
    });
  });
};

// Patch dns.promises.resolveTxt
const origResolveTxt = dns.promises.resolveTxt;
dns.promises.resolveTxt = (name) => {
  return new Promise((resolve, reject) => {
    resolver.resolveTxt(name, (err, addresses) => {
      if (err) reject(err);
      else resolve(addresses);
    });
  });
};

// Also patch the callback-based versions (used by MongoDB driver)
const origResolveSrvCb = dns.resolveSrv;
dns.resolveSrv = (name, callback) => {
  resolver.resolveSrv(name, callback);
};

const origResolveTxtCb = dns.resolveTxt;
dns.resolveTxt = (name, callback) => {
  resolver.resolveTxt(name, callback);
};

console.log('[dns-override] Patched DNS resolution to use Google DNS (8.8.8.8)');
