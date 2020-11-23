package com.glitterlabs.terraformui.service;

import java.io.FileWriter;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.glitterlabs.terraformui.dao.ProjectRepository;
import com.glitterlabs.terraformui.model.Project;
import com.glitterlabs.terraformui.model.Resource;
import com.glitterlabs.terraformui.util.DirectoryUtil;
import com.glitterlabs.terraformui.util.GlobalProperties;

/**
 * The Class CloudProjectService.
 */
@Service
public class ResourceService {
	private static final Logger LOG = LoggerFactory.getLogger(ResourceService.class);

	/** The dao. */
	@Autowired
	private ProjectRepository dao;

	@Autowired
	private GlobalProperties prop;

	/**
	 * Creates the resource.
	 *
	 * @param projectId the project id
	 * @param name the name
	 * @param content the content
	 * @throws IOException Signals that an I/O exception has occurred.
	 */
	public void create(final String projectId, final String name, final String content, final String resourceType) throws IOException {
		Optional<Project> project = this.dao.findById(Long.valueOf(projectId));
		if (project.isPresent()) {
			final Project realProj = project.get();
			final Path path = Paths.get(this.prop.getDirectoryPath(), project.get().getPath(), name);
			if (StringUtils.equalsIgnoreCase(resourceType, "file")) {
				Files.createFile(path);
				final FileWriter fileWriter = new FileWriter(path.toFile());
				fileWriter.write(content);
				fileWriter.flush();
				fileWriter.close();
			} else if (StringUtils.equalsIgnoreCase(resourceType, "directory")) {
				Files.createDirectory(path);
			}
		} else {
			LOG.error("Error getting the project by ID");
		}
	}

	//TODO add in a folder for pre-built images, since this will be easier than creating new every time

	public List<Resource> findAllResources(final String projectId, final String subpath) {
		List<Resource> result = new ArrayList<>();
		Optional<Project> project = this.dao.findById(Long.valueOf(projectId));
		if (project.isPresent()) {
			final Project realProj = project.get();
			try {
				result = DirectoryUtil.getResources(Paths.get(this.prop.getDirectoryPath(), realProj.getPath(), subpath));
			} catch (final IOException e) {
				LOG.error("Unable to get resources.", e);
			}
		}
		return result;
	}

	//Consider adding the getProjectID

	public String getResourceContent(final String projectId, final String resourcePath) throws IOException {
		byte[] bytes;
		Optional<Project> project = this.dao.findById(Long.valueOf(projectId));
		if (project.isPresent()) {
			final Project realProj = project.get();
			final Path path = Paths.get(this.prop.getDirectoryPath(), realProj.getPath(), resourcePath);
			bytes = Files.readAllBytes(path);
			return new String(bytes);
		} else {
			LOG.error("Unable to get bytes.");
		}
		return "";
	}

}
