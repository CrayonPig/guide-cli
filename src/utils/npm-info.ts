import urlJoin from 'url-join';
import semver from 'semver';
import axios from 'axios';

function getDefaultRegistry(isOriginal = false) {
  return isOriginal ? 'https://registry.npmjs.com' : 'https://registry.npmmirror.com';
}

function getNpmInfo(npmName: string, registry?: string) {
  // 获取npm包详情
  if (!npmName) {
    return null;
  }
  const npmRegistry = registry || getDefaultRegistry();
  const npmInfoUrl = urlJoin(npmRegistry, npmName);
  return axios.get(npmInfoUrl).then((res) => {
    if (res.status === 200) {
      return res.data;
    }
    return null;
  }).catch((err: unknown) => Promise.reject(err));
}

async function getNpmVersion(npmName: string, registry?: string) {
  // 获取npm包版本
  const res = await getNpmInfo(npmName, registry);
  if (res) {
    return Object.keys(res.versions);
  }
  return [];
}

function getSemverVersions(baseVersion: string, versions: Array<string>) {
  // 获取大于当前版本号, 并倒序排列
  const newVersions = versions.filter((version) => semver.satisfies(version, `>${baseVersion}`)).sort((a, b) => (semver.gt(b, a) ? 1 : -1));
  return newVersions;
}

async function getNpmSemverVersion(baseVersion: string, npmName: string, registry?: string) {
  const versions = await getNpmVersion(npmName, registry);
  const newVersions = getSemverVersions(baseVersion, versions);
  if (newVersions && newVersions.length) {
    return newVersions[0];
  }
  return null;
}

export {
  getNpmSemverVersion,
  getSemverVersions
};
