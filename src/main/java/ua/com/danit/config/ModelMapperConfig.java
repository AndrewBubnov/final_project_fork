package ua.com.danit.config;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class ModelMapperConfig {

  @Autowired
  private ModelMapper modelMapper;

  //  @Autowired
  //  public ModelMapperConfig(ModelMapper modelMapper) {
  //    this.modelMapper = modelMapper;
  //  }

  public void initializeModelMapper() {
  }
}
